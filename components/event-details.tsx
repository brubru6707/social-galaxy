import { useUser } from '@/contexts/UserContext';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type EventDetailsProps = {
  event: {
    id: string;
    title: string;
    description?: string;
    location: string;
    host?: string;
    date?: string;
    time?: string;
    category?: string;
    maxAttendees?: number;
    event_picture?: string;
    attendees?: string[];
  };
};

export default function EventDetails({ event }: EventDetailsProps) {
  const { currentUser } = useUser();
  const isUserAttending = currentUser && event.attendees?.includes(currentUser.id);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {event.event_picture && (
        <Image source={{ uri: event.event_picture }} style={styles.image} />
      )}
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.location}>{event.location}</Text>
      {event.date && <Text style={styles.info}>Date: {event.date}</Text>}
      {event.time && <Text style={styles.info}>Time: {event.time}</Text>}
      {event.category && <Text style={styles.info}>Category: {event.category}</Text>}
      {event.maxAttendees && <Text style={styles.info}>Max Attendees: {event.maxAttendees}</Text>}
      {event.host && <Text style={styles.info}>Host: {event.host}</Text>}
      {event.description && <Text style={styles.description}>{event.description}</Text>}
      
      {/* RSVP Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[
          styles.rsvpButton, 
          { backgroundColor: '#4CAF50' },
          isUserAttending && styles.selectedButton
        ]}>
          <Text style={styles.rsvpButtonText}>Going</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[
          styles.rsvpButton, 
          { backgroundColor: '#FF9800' }
        ]}>
          <Text style={styles.rsvpButtonText}>Maybe</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[
          styles.rsvpButton, 
          { backgroundColor: '#F44336' }
        ]}>
          <Text style={styles.rsvpButtonText}>Can't Go</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 18,
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  location: {
    fontSize: 18,
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 24,
    width: '100%',
  },
  rsvpButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.8,
  },
  rsvpButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
