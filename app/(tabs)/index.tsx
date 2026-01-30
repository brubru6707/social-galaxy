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
import Confetti from '../../components/Confetti';
import EventDetails from '../../components/event-details';
import { UserType as GalaxyUserType } from '../../components/lobby';
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

  const { currentUser, dailyQuestion, addVote, showResults, setShowResults, votes } = useUser();
  // Fake random results - only calculated once when results are shown
  const [finalLeftPercent, setFinalLeftPercent] = useState(0);
  const [finalRightPercent, setFinalRightPercent] = useState(0);
  const leftAnim = useRef(new Animated.Value(0)).current;
  const rightAnim = useRef(new Animated.Value(0)).current;
  const [showModal, setShowModal] = useState(true);
  const [answeredHotTake, setAnsweredHotTake] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [galaxyUsers, setGalaxyUsers] = useState<GalaxyUserType[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activePage, setActivePage] = useState(0); // 0: Event, 1: Lobby
  const [showGalaxy, setShowGalaxy] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Reset percentages and animations when results are hidden
  useEffect(() => {
    if (!showResults) {
      setFinalLeftPercent(0);
      setFinalRightPercent(0);
      leftAnim.setValue(0);
      rightAnim.setValue(0);
      setShowConfetti(false);
    }
  }, [showResults, leftAnim, rightAnim]);

  // Show modal for new question
  useEffect(() => {
    if (dailyQuestion && answeredHotTake !== dailyQuestion.question) {
      setShowModal(true);
      setAnsweredHotTake(null); // Reset answered state for new question
    }
  }, [dailyQuestion, answeredHotTake]);

  // Set final percentages once when results are shown
  useEffect(() => {
    if (showResults && answeredHotTake && finalLeftPercent === 0) {
      const leftVotes = Math.floor(Math.random() * 1000) + 100;
      const rightVotes = Math.floor(Math.random() * 1000) + 100;
      const totalVotes = leftVotes + rightVotes;
      const leftPercent = Math.round((leftVotes / totalVotes) * 100);
      const rightPercent = 100 - leftPercent;
      setFinalLeftPercent(leftPercent);
      setFinalRightPercent(rightPercent);
    }
  }, [showResults, answeredHotTake, finalLeftPercent]);

  useEffect(() => {
    if (answeredHotTake && showResults && finalLeftPercent > 0) {
      Animated.parallel([
        Animated.timing(leftAnim, {
          toValue: finalLeftPercent,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(rightAnim, {
          toValue: finalRightPercent,
          duration: 2000,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setShowConfetti(true);
        // Reset confetti after animation
        setTimeout(() => setShowConfetti(false), 4000);
      });
    }
  }, [answeredHotTake, showResults, leftAnim, rightAnim, finalLeftPercent, finalRightPercent]);

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

  if (showGalaxy && selectedEvent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Social Galaxy</Text>
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowGalaxy(false)}>
            <Text style={styles.closeText}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
          <SocialGalaxy users={galaxyUsers} />
        </View>
      </SafeAreaView>
    );
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
          {/* Lobby Page */}
          <View style={{ width }}>
            <TouchableOpacity style={[styles.actionButton, { position: 'absolute', top: 20, right: 20, backgroundColor: '#FF5CB3', zIndex: 20 }]} onPress={() => setShowGalaxy(true)}>
              <Text style={styles.actionButtonText}>Social Galaxy</Text>
            </TouchableOpacity>
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
              <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 60, zIndex: 10 }} />
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
        {/* Hot Question Modal */}
        <Modal visible={showModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal(false)}>
                <Text style={styles.closeText}>X</Text>
              </TouchableOpacity>
              <Text style={[styles.modalQuestion, { textAlign: 'center' }]}>{questionText}</Text>
              <View style={styles.buttonContainerRow}>
                <TouchableOpacity style={[styles.optionButton, styles.leftOptionButton]} onPress={() => { setShowModal(false); setAnsweredHotTake(questionText); addVote('left'); }}>
                  <Text style={styles.leftOptionText}>{option1}</Text>
                </TouchableOpacity>
                <View style={styles.vsContainer}>
                  <Text style={styles.vsText}>vs</Text>
                </View>
                <TouchableOpacity style={[styles.optionButton, styles.rightOptionButton]} onPress={() => { setShowModal(false); setAnsweredHotTake(questionText); addVote('right'); }}>
                  <Text style={styles.rightOptionText}>{option2}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Fun Header */}
            <View style={styles.headerWrap}>
              <Text style={styles.logo}>partiful</Text>
              {answeredHotTake && (
                <View style={styles.hotTakeHeaderWrap}>
                  {showResults ? (
                    <View style={styles.progressContainer}>
                      <View style={styles.percentageContainer}>
                        <Text style={styles.percentageText}>{finalLeftPercent}%</Text>
                        <Text style={styles.percentageText}>{finalRightPercent}%</Text>
                      </View>
                      <View style={styles.barContainer}>
                        <Animated.View style={[styles.leftBar, { width: leftAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]}>
                          <Text style={styles.barText}>{option1}</Text>
                        </Animated.View>
                        <Animated.View style={[styles.rightBar, { width: rightAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]}>
                          <Text style={styles.barText}>{option2}</Text>
                        </Animated.View>
                      </View>
                    </View>
                  ) : (
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
                  )}
                </View>
              )}
              <Text style={styles.greeting}>Hey, {currentUser?.name || 'Party Person'}! 🎉</Text>
              <Text style={styles.subtitle}>Your social universe, reimagined</Text>
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
        <Confetti active={showConfetti} />
      </>
}
    </>
  );
}

const { width } = Dimensions.get('window');
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
    paddingVertical: 16,
    paddingHorizontal: 18,
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
    fontSize: 16,
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
});
