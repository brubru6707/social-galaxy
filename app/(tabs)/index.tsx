import { useUser } from '@/contexts/UserContext';
import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import mockData from '../../assets/mock_data.json';

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

const allEvents = mockData.events || [];
const currentUserId = mockData.current_user;
const currentUserData = mockData.users.find(u => u.id === currentUserId);
const userEventIds = currentUserData?.events_gone_to?.map(e => e.id) || [];
const recentEvents = allEvents.filter(e => userEventIds.includes(e.id));

export default function HomeScreen() {
  const { currentUser } = useUser();
  const [showModal, setShowModal] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  const firstQuestion = currentUserData?.hot_take_answers?.[0];
  const questionText = firstQuestion?.question_text || '';
  const [option1, option2] = questionText.split(' vs ');

  const attendees: UserType[] = selectedEvent ? selectedEvent.attendees.map(id => mockData.users.find(u => u.id === id)).filter((u): u is UserType => u !== undefined) : [];

  // Debug statements
  console.log('Current User ID:', currentUserId);
  console.log('Current User Data:', currentUserData);
  console.log('Events Gone To (Titles):', currentUserData?.events_gone_to?.map(e => e.title));
  console.log('User Event IDs:', userEventIds);
  console.log('Recent Events:', recentEvents);

  return (
    <>
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
    <Modal visible={!!selectedEvent} transparent animationType="fade" onRequestClose={() => setSelectedEvent(null)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedEvent(null)}>
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>
          <Text style={styles.modalQuestion}>{selectedEvent?.title} - Social Galaxy</Text>
          <ScrollView style={styles.attendeesScroll}>
            {attendees.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <Image source={{ uri: user.profile_picture }} style={styles.userImage} />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userBio}>{user.bio}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
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
              <TouchableOpacity key={event.id} style={styles.eventCard} onPress={() => setSelectedEvent(event)}>
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
              <TouchableOpacity key={event.id} style={styles.eventCard} onPress={() => setSelectedEvent(event)}>
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
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  attendeesScroll: {
    maxHeight: 300,
    width: '100%',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  userBio: {
    fontSize: 14,
    color: '#ccc',
  },
});
