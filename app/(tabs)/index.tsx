import { useUser } from '@/contexts/UserContext';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import mockData from '../../assets/mock_data.json';
import stickers from '../../assets/stickers.json';
import AnimatedLiquidGradient from '../../components/AnimatedLiquidGradient';
import Confetti from '../../components/Confetti';
import EventDetails from '../../components/event-details';
import EventQuestionModal from '../../components/event-question-modal';
import HotTakeResults from '../../components/hot-take-results';
import { UserType as GalaxyUserType } from '../../components/lobby';
import { getNemesisAndBestie } from '../../components/lobby-match-utils';
import { SocialGalaxy, calculateMatchScore } from '../../components/social-galaxy';

// Dummy data
const recentActivities = [
  { id: 1, type: 'connection', message: 'You matched with Sarah!', time: '2h ago' },
  { id: 2, type: 'event', message: 'Beach Volleyball event created', time: '5h ago' },
  { id: 3, type: 'profile', message: 'Alex viewed your profile', time: '1d ago' },
];

type EventType = {
  id: string;
  title: string;
  description: string;
  location: string;
  host: string;
  total_spots: number;
  spots_taken: number;
  cost_per_person: number;
  rsvp_deadline: string;
  event_picture: string;
  attendees: string[];
};

type UserType = {
  id: string;
  name: string;
  bio: string;
  dob: string;
  profile_picture: string;
  events_gone_to: any[];
  hot_take_answers: any[];
};

export default function HomeScreen() {
  const allEvents = mockData.events || [];
  const currentUserId = mockData.current_user;
  const currentUserData = mockData.users.find(u => u.id === currentUserId);
  const userEventIds = currentUserData?.events_gone_to?.map(e => e.id) || [];
  const recentEvents = allEvents.filter(e => userEventIds.includes(e.id));

  const { currentUser, dailyQuestion, addVote, showResults, setShowResults, votes, finalResults } = useUser();
  // Use shared final results from UserContext instead of local state
  const finalLeftPercent = finalResults?.leftPercent || 0;
  const finalRightPercent = finalResults?.rightPercent || 0;
  const leftAnim = useRef(new Animated.Value(0)).current;
  const rightAnim = useRef(new Animated.Value(0)).current;
  const [showModal, setShowModal] = useState(true);
  const [answeredHotTake, setAnsweredHotTake] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [galaxyUsers, setGalaxyUsers] = useState<GalaxyUserType[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activePage, setActivePage] = useState(0); // 0: Event, 1: Lobby/Galaxy
  const [activeTab, setActiveTab] = useState<'lobby' | 'galaxy'>('lobby'); // Tab within the second page
  const [showConfetti, setShowConfetti] = useState(false);
  const [userAnswer, setUserAnswer] = useState<'left' | 'right' | null>(null);

  // Reset percentages and animations when results are hidden
  useEffect(() => {
    if (!showResults) {
      leftAnim.setValue(0);
      rightAnim.setValue(0);
      setShowConfetti(false);
      setUserAnswer(null);
    }
  }, [showResults, leftAnim, rightAnim]);

  // Show modal for new question
  useEffect(() => {
    if (dailyQuestion && answeredHotTake !== dailyQuestion.question) {
      setShowModal(true);
      setAnsweredHotTake(null); // Reset answered state for new question
    }
  }, [dailyQuestion, answeredHotTake]);

  useEffect(() => {
    if (answeredHotTake && showResults && finalResults) {
      Animated.parallel([
        Animated.timing(leftAnim, {
          toValue: finalResults.leftPercent,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(rightAnim, {
          toValue: finalResults.rightPercent,
          duration: 2000,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setShowConfetti(true);
        // Reset confetti after animation
        setTimeout(() => setShowConfetti(false), 4000);
      });
    }
  }, [answeredHotTake, showResults, leftAnim, rightAnim, finalResults]);

  // Determine winning emoji for confetti
  const getWinningEmoji = () => {
    if (!userAnswer || !finalResults) return undefined;
    
    const userWon = (userAnswer === 'left' && finalResults.leftPercent >= 50) || 
                     (userAnswer === 'right' && finalResults.rightPercent >= 50);
    
    if (!userWon) return undefined;
    
    const winningOption = userAnswer === 'left' ? option1 : option2;
    return stickers[winningOption as keyof typeof stickers] || '🎉';
  };

  const questionText = dailyQuestion ? dailyQuestion.question : '';
  const option1 = dailyQuestion ? dailyQuestion.left : '';
  const option2 = dailyQuestion ? dailyQuestion.right : '';

  function handleEventPress(event: EventType) {
    setSelectedEvent(event);
    setShowModal(false);
    // Set galaxyUsers for this event
    const users = mockData.users.filter((u: GalaxyUserType) => event.attendees.includes(u.id));
    setGalaxyUsers(users);
    setActivePage(0); // Always start at Event Details
  }

  function handleCloseEventDetails() {
    setSelectedEvent(null);
    setActivePage(0);
  }

  return (
    <>
      {selectedEvent ?
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Event Details</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleCloseEventDetails}>
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={e => {
            const page = Math.round(e.nativeEvent.contentOffset.x / width);
            setActivePage(page);
          }}
          contentOffset={{ x: activePage * width, y: 0 }}
        >
          {/* Event Details Page */}
          <View style={{ width }}>
            <EventDetails event={selectedEvent} />
            <PanGestureHandler
              onHandlerStateChange={(event) => {
                if (event.nativeEvent.state === State.END) {
                  const { translationX } = event.nativeEvent;
                  if (translationX < -50) {
                    scrollViewRef.current?.scrollTo({ x: width, animated: true });
                    setActivePage(1);
                  }
                }
              }}
            >
              <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, zIndex: 10 }} />
            </PanGestureHandler>
          </View>
          {/* Lobby/Galaxy Page with Tabs */}
          <View style={{ width, flex: 1 }}>
            {/* Tab Bar */}
            <View style={styles.tabBar}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'lobby' && styles.tabActive]}
                onPress={() => setActiveTab('lobby')}
              >
                <Text style={[styles.tabText, activeTab === 'lobby' && styles.tabTextActive]}>
                  Lobby
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'galaxy' && styles.tabActive]}
                onPress={() => setActiveTab('galaxy')}
              >
                <Text style={[styles.tabText, activeTab === 'galaxy' && styles.tabTextActive]}>
                  Social Galaxy
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            {activeTab === 'lobby' ? (
              <View style={{ flex: 1 }}>
                {/* Nemesis and Bestie Section */}
                {(() => {
                  const { nemesis, bestie } = currentUser ? getNemesisAndBestie(currentUser, galaxyUsers) : { nemesis: null, bestie: null };
                  return (
                    <View style={styles.matchRowTabs}>
                      {nemesis && (
                        <View style={[styles.matchCard, { backgroundColor: '#2A002A' }]}>
                          <Text style={[styles.matchLabel, { color: '#FF5CB3' }]}>Nemesis</Text>
                          <Image source={{ uri: nemesis.profile_picture }} style={styles.avatar} />
                          <Text style={styles.matchName}>{nemesis.name}</Text>
                          <Text style={[styles.matchScoreText, { color: '#FF5CB3' }]}>Match: {currentUser && calculateMatchScore(currentUser, nemesis)}%</Text>
                        </View>
                      )}
                      {bestie && (
                        <View style={[styles.matchCard, { backgroundColor: '#002A1A' }]}>
                          <Text style={[styles.matchLabel, { color: '#5CFFB3' }]}>Bestie</Text>
                          <Image source={{ uri: bestie.profile_picture }} style={styles.avatar} />
                          <Text style={styles.matchName}>{bestie.name}</Text>
                          <Text style={[styles.matchScoreText, { color: '#5CFFB3' }]}>Match: {currentUser && calculateMatchScore(currentUser, bestie)}%</Text>
                        </View>
                      )}
                    </View>
                  );
                })()}
                <ScrollView contentContainerStyle={styles.lobbyScroll}>
                  {galaxyUsers.length === 0 ? (
                    <Text style={styles.emptyText}>No attendees found</Text>
                  ) : (
                    galaxyUsers.map((user) => (
                      <View key={user.id} style={styles.userCard}>
                        <Image source={{ uri: user.profile_picture }} style={styles.avatar} />
                        <View style={styles.userInfo}>
                          <Text style={styles.name}>{user.name}</Text>
                          <Text style={styles.bio}>{user.bio}</Text>
                          <Text style={styles.stats}>
                            Events attended: {user.events_gone_to.length} | Hot takes: {user.hot_take_answers.length}
                          </Text>
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <SocialGalaxy users={galaxyUsers} />
              </View>
            )}

            {/* Swipe back gesture */}
            <PanGestureHandler
              onHandlerStateChange={(event) => {
                if (event.nativeEvent.state === State.END) {
                  const { translationX } = event.nativeEvent;
                  if (translationX > 50) {
                    scrollViewRef.current?.scrollTo({ x: 0, animated: true });
                    setActivePage(0);
                  }
                }
              }}
            >
              <View style={{ position: 'absolute', left: 0, top: 50, bottom: 0, width: 60, zIndex: 10 }} />
            </PanGestureHandler>
          </View>
        </ScrollView>
        {/* User Profile Modal */}
        <Modal visible={!!selectedUser} transparent animationType="fade" onRequestClose={() => setSelectedUser(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.userProfileModal}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedUser(null)}>
                <Text style={styles.closeText}>X</Text>
              </TouchableOpacity>
              {selectedUser && currentUserData && (
                <>
                  <Image source={{ uri: selectedUser.user.profile_picture }} style={styles.profileImage} />
                  <Text style={styles.cardTitle}>{selectedUser.user.name}</Text>
                  <View style={styles.matchScoreContainer}>
                    <Text style={styles.matchScoreLabel}>Match Score</Text>
                    <Text style={styles.matchScore}>{calculateMatchScore(currentUserData, selectedUser.user)}%</Text>
                  </View>
                  <Text style={styles.cardBio}>{selectedUser.user.bio}</Text>
                  <Text style={styles.cardStats}>
                    Events attended: {selectedUser.user.events_gone_to.length} | Hot takes: {selectedUser.user.hot_take_answers.length}
                  </Text>
                </>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
      : 
      <>
        {/* Hot Question Modal (shared component) */}
        <EventQuestionModal
          visible={showModal}
          question={questionText}
          leftOption={option1}
          rightOption={option2}
          onSelect={(answer) => {
            setShowModal(false);
            setAnsweredHotTake(questionText);
            setUserAnswer(answer);
            addVote(answer);
          }}
          onClose={() => setShowModal(false)}
        />
        {/* Hot Take Results Modal */}
        {(() => {
          const userWon = userAnswer ? (userAnswer === 'left' ? (finalResults?.leftPercent || 0) >= (finalResults?.rightPercent || 0) : (finalResults?.rightPercent || 0) >= (finalResults?.leftPercent || 0)) : true;
          return showResults && finalResults && (
            <Modal visible={true} transparent={false} animationType="fade" onRequestClose={() => setShowResults(false)}>
              <HotTakeResults
                leftOption={option1}
                rightOption={option2}
                leftPercent={finalResults.leftPercent}
                rightPercent={finalResults.rightPercent}
                animate={true}
                onClose={() => setShowResults(false)}
                userWon={userWon}
              />
            </Modal>
          );
        })()}
        <SafeAreaView style={styles.container}>
          {/* Animated Liquid Gradient Background */}
          <AnimatedLiquidGradient />
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Fun Header */}
            <View style={styles.headerWrap}>
              <Text style={styles.logo}>partiful</Text>
              {answeredHotTake && !showResults && (
                <View style={styles.hotTakeHeaderWrap}>
                  <View style={styles.questionContainer}>
                    <Text style={styles.questionText}>{questionText}</Text>
                    <View style={styles.optionsRow}>
                      <Text style={[styles.optionText, styles.leftOption]}>{option1}</Text>
                      <View style={styles.vsContainer}>
                        <Text style={styles.vsText}>vs</Text>
                      </View>
                      <Text style={[styles.optionText, styles.rightOption]}>{option2}</Text>
                    </View>
                  </View>
                </View>
              )}
              <Text style={styles.greeting}>Hey, {currentUser?.name || 'Party Person'}! 🎉</Text>
            </View>
            {/* Recent Events Carousel */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Events</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventScroll}>
                {recentEvents.map((event) => (
                  <TouchableOpacity key={event.id} style={styles.eventCard} onPress={() => handleEventPress(event)}>
                    <Image source={{ uri: event.event_picture }} style={styles.eventImage} />
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventInfo}>{event.location}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            {/* Trending Events */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trending</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventScroll}>
                {allEvents.slice(0, 5).map((event) => (
                  <TouchableOpacity key={event.id} style={styles.eventCard} onPress={() => handleEventPress(event)}>
                    <Image source={{ uri: event.event_picture }} style={styles.eventImage} />
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventInfo}>{event.location}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

          </ScrollView>
        </SafeAreaView>
        <Confetti active={showConfetti} emoji={getWinningEmoji()} />
      </>
}
    </>
  );
}

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  hotTakeHeaderWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  hotTakeHeader: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 6,
    textAlign: 'center',
    maxWidth: '90%',
  },
    buttonContainerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
    },
    leftOptionButton: {
      backgroundColor: '#FF5CB3',
      marginRight: 8,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 18,
    },
    rightOptionButton: {
      backgroundColor: '#4455aa',
      marginLeft: 8,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 18,
    },
    leftOptionText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    rightOptionText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    vsContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 4,
    },
    vsText: {
      color: '#aaa',
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 2,
    },
  progressContainer: {
    alignItems: 'center',
    width: '100%',
  },
  percentageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  percentageText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionContainer: {
    alignItems: 'center',
    width: '100%',
  },
  questionText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  leftOption: {
    color: '#FF5CB3',
    textAlign: 'left',
  },
  rightOption: {
    color: '#4455aa',
    textAlign: 'right',
  },
  barContainer: {
    position: 'relative',
    height: 30,
    width: '100%',
    backgroundColor: '#333',
    borderRadius: 10,
  },
  leftBar: {
    position: 'absolute',
    left: 0,
    height: '100%',
    backgroundColor: '#FF5CB3',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightBar: {
    position: 'absolute',
    right: 0,
    height: '100%',
    backgroundColor: '#4455aa',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  lobbyScroll: {
    padding: 20,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  bio: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 5,
    lineHeight: 20,
  },
  stats: {
    fontSize: 12,
    color: '#FFD700',
  },
  emptyText: {
    color: '#ccc',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  canvasLayer: {
    position: 'absolute',
    // Removed duplicate modalOverlay, closeButton, and closeText definitions
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  cardBio: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 22,
  },
  cardStats: {
    fontSize: 14,
    color: '#FFD700',
    textAlign: 'center',
  },
  matchScoreContainer: {
    backgroundColor: '#FFD700',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  matchScoreLabel: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
    textAlign: 'center',
  },
  matchScore: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerWrap: {
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  logo: {
    fontSize: 38,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'lowercase',
    fontFamily: 'Avenir-Black',
    textAlign: 'left',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'left',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    letterSpacing: 1,
  },
  eventScroll: {
    marginBottom: 10,
  },
  eventCard: {
    borderRadius: 24,
    padding: 16,
    marginRight: 18,
    width: width * 0.6,
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  eventImage: {
    width: '100%',
    height: 110,
    borderRadius: 18,
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  eventInfo: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  actionButton: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#FF5CB3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  activityItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#333',
  },
  activityMessage: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  quoteContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 18,
    padding: 22,
    marginTop: 18,
    alignItems: 'center',
    shadowColor: '#00BFAE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  quote: {
    fontSize: 18,
    color: '#fff',
    fontStyle: 'italic',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  debugContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  debugTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  debugText: {
    fontSize: 14,
    color: '#ccc',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#000',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF5CB3',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalQuestion: {
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#FF5CB3',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  modalOptionText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userProfileModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  resultsModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
  },
  resultsQuestion: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultsStats: {
    width: '100%',
    marginBottom: 20,
  },
  resultsOption: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 10,
  },
  closeResultsButton: {
    backgroundColor: '#FF5CB3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeResultsText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginVertical: 16,
    marginTop: 60, // Account for the absolute positioned button
  },
  matchRowTabs: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginVertical: 16,
  },
  // Tab Bar styles
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 30, 40, 0.95)',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#FFD700',
  },
  tabText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  matchCard: {
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    minWidth: 120,
    marginHorizontal: 8,
  },
  matchLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  matchName: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
  },
  matchScoreText: {
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 2,
  },
});
