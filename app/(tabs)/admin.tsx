import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import mockData from '../../assets/mock_data.json';
import AnimatedLiquidGradient from '../../components/AnimatedLiquidGradient';
import { useUser } from '../../contexts/UserContext';

export default function AdminScreen() {
  const { dailyQuestion, votes, endDay, newDay, allUsers, endEvent } = useUser();

  // Get all events from mock data (or wherever your events are stored)
  const allEvents = mockData.events || [];

  const handleNewDay = () => {
    if (dailyQuestion) {
      newDay();
    }
  };

  const handleEndDay = () => {
    endDay();
    // Results will be shown on the home page
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedLiquidGradient />
      <Text style={styles.title}>Admin Portal</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Day</Text>
        {dailyQuestion ? (
          <Text style={styles.question}>{dailyQuestion.question}</Text>
        ) : (
          <Text style={styles.noQuestion}>No active question</Text>
        )}
        <Text style={styles.votes}>Votes: {dailyQuestion?.left}: {votes.left} | {dailyQuestion?.right}: {votes.right}</Text>
      </View>
      {/* List all events and their attendees */}
      <ScrollView style={{ maxHeight: 300, marginBottom: 20 }}>
        {allEvents.map(event => {
          // Find users who have RSVP'd (attending) to this event
          const attendees = allUsers.filter(user => user.events_gone_to.includes(event.id));
          return (
            <View key={event.id} style={[styles.section, { backgroundColor: '#222', marginBottom: 12 }]}> 
              <Text style={[styles.sectionTitle, { color: '#FF5CB3' }]}>{event.title}</Text>
              <Text style={{ color: '#fff', marginBottom: 6 }}>Attendees ({attendees.length}):</Text>
              {attendees.length > 0 ? (
                attendees.map(user => (
                  <Text key={user.id} style={{ color: '#FFD700', marginLeft: 8 }}>{user.name}</Text>
                ))
              ) : (
                <Text style={{ color: '#888', marginLeft: 8 }}>No attendees yet</Text>
              )}
              {/* End Event Button */}
              <TouchableOpacity
                style={[styles.button, { marginTop: 10, backgroundColor: '#FF5CB3' }]}
                onPress={() => endEvent(event.id)}
              >
                <Text style={styles.buttonText}>End Event</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleEndDay}>
          <Text style={styles.buttonText}>End of Day</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleNewDay}>
          <Text style={styles.buttonText}>New Day</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  question: {
    fontSize: 18,
    color: '#FFD700',
    marginBottom: 10,
  },
  noQuestion: {
    fontSize: 16,
    color: '#888',
  },
  votes: {
    fontSize: 16,
    color: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#FF5CB3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
