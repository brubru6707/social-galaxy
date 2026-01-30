import { useUser } from '@/contexts/UserContext';
import { OrbitControls } from '@react-three/drei/native';
import { Canvas } from '@react-three/fiber';
import React, { Suspense, useRef, useState } from 'react';
import {
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
import { UserType as GalaxyUserType } from '../../components/lobby';
import { GalaxyField, calculateMatchScore } from '../../components/social-galaxy';

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

  const { currentUser } = useUser();
  const [showModal, setShowModal] = useState(true);
  const [galaxyVisible, setGalaxyVisible] = useState(false);
  const [galaxyUsers, setGalaxyUsers] = useState<GalaxyUserType[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const firstQuestion = currentUserData?.hot_take_answers?.[0];
  const questionText = firstQuestion?.question_text || '';
  const [option1, option2] = questionText.split(' vs ');

  function handleEventPress(event: EventType) {
    console.log('Event clicked:', event.title);
    console.log('Event attendees:', event.attendees);
    
    // Find users who are attendees of the event
    const users = mockData.users.filter((u: GalaxyUserType) => event.attendees.includes(u.id));
    console.log('Filtered users:', users.length, users);
    
    if (users.length === 0) {
      console.warn('No attendees found for event:', event.title);
      return;
    }
    
    console.log('Setting galaxyUsers to', users.length);
    setGalaxyUsers(users);
    console.log('Setting showModal to false');
    setShowModal(false); // Close hot question modal first
    setTimeout(() => {
      console.log('Setting galaxyVisible to true');
      setGalaxyVisible(true);
    }, 300); // Wait for modal close animation
  }

  return (
    galaxyVisible ? (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>EVENT VIEWS</Text>
          <TouchableOpacity style={styles.closeButton} onPress={() => setGalaxyVisible(false)}>
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>
        </View>
        <ScrollView ref={scrollViewRef} horizontal scrollEnabled={false} pagingEnabled={false} showsHorizontalScrollIndicator={false}>
          <View style={{ width }}>
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
              onGestureEvent={(event) => {
                // Handle horizontal swipe at top of lobby
              }}
              onHandlerStateChange={(event) => {
                if (event.nativeEvent.state === State.END) {
                  const { translationX } = event.nativeEvent;
                  if (Math.abs(translationX) > 50) {
                    const targetX = translationX > 0 ? 0 : width;
                    scrollViewRef.current?.scrollTo({ x: targetX, animated: true });
                  }
                }
              }}
            >
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '20%', zIndex: 10 }} />
            </PanGestureHandler>
            <PanGestureHandler
              onGestureEvent={(event) => {
                // Handle horizontal swipe at bottom of lobby
              }}
              onHandlerStateChange={(event) => {
                if (event.nativeEvent.state === State.END) {
                  const { translationX } = event.nativeEvent;
                  if (Math.abs(translationX) > 50) {
                    const targetX = translationX > 0 ? 0 : width;
                    scrollViewRef.current?.scrollTo({ x: targetX, animated: true });
                  }
                }
              }}
            >
              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '20%', zIndex: 10 }} />
            </PanGestureHandler>
          </View>
          <View style={{ width }}>
            <View style={styles.canvasLayer}>
              <Suspense fallback={<Text style={{ color: 'white', textAlign: 'center', marginTop: 100 }}>Loading galaxy...</Text>}>
                <Canvas 
                  camera={{ position: [0, 0, 30], fov: 60 }}
                  performance={{ min: 0.5 }}
                  gl={{ antialias: false, powerPreference: 'high-performance' }}
                >
                  <color attach="background" args={["#000000"]} />
                  <OrbitControls makeDefault enablePan={false} enableZoom={true} enableRotate={true} rotateSpeed={2} zoomSpeed={0.1} />
                  <GalaxyField onSelect={setSelectedUser} users={galaxyUsers} />
                </Canvas>
              </Suspense>
            </View>
            <PanGestureHandler
              onGestureEvent={(event) => {
                // Handle horizontal swipe at top
              }}
              onHandlerStateChange={(event) => {
                if (event.nativeEvent.state === State.END) {
                  const { translationX } = event.nativeEvent;
                  if (Math.abs(translationX) > 50) {
                    const targetX = translationX > 0 ? 0 : width;
                    scrollViewRef.current?.scrollTo({ x: targetX, animated: true });
                  }
                }
              }}
            >
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '20%', zIndex: 10 }} />
            </PanGestureHandler>
            <PanGestureHandler
              onGestureEvent={(event) => {
                // Handle horizontal swipe at bottom
              }}
              onHandlerStateChange={(event) => {
                if (event.nativeEvent.state === State.END) {
                  const { translationX } = event.nativeEvent;
                  if (Math.abs(translationX) > 50) {
                    const targetX = translationX > 0 ? 0 : width;
                    scrollViewRef.current?.scrollTo({ x: targetX, animated: true });
                  }
                }
              }}
            >
              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '20%', zIndex: 10 }} />
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
    ) : (
      <>
        {/* Hot Question Modal */}
        <Modal visible={showModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal(false)}>
                <Text style={styles.closeText}>X</Text>
              </TouchableOpacity>
              <Text style={styles.modalQuestion}>{questionText}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.optionButton} onPress={() => setShowModal(false)}>
                  <Text style={styles.optionText}>{option1}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButton} onPress={() => setShowModal(false)}>
                  <Text style={styles.optionText}>{option2}</Text>
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
      </>
    )
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
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
  closeButton: {
    backgroundColor: '#222',
    borderRadius: 20,
    padding: 10,
  },
  closeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
    top: 0,
    left: 0,
    zIndex: 1,
    width,
    height: Dimensions.get('window').height - 100, // Adjust for header
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
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
  optionText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
