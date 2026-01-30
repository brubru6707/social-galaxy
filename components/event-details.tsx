import React from 'react';
import { Image, ScrollView, StyleSheet, Text } from 'react-native';

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
  };
};

export default function EventDetails({ event }: EventDetailsProps) {
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
});
