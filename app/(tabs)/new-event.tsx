import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewEventScreen() {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    maxAttendees: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setEventData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateEvent = () => {
    // Validate required fields
    if (!eventData.title || !eventData.date || !eventData.location) {
      Alert.alert('Error', 'Please fill in all required fields (Title, Date, Location)');
      return;
    }

    // Dummy creation logic
    Alert.alert(
      'Event Created!',
      `Your event "${eventData.title}" has been created successfully!`,
      [{ text: 'OK', onPress: () => console.log('Event created:', eventData) }]
    );

    // Reset form
    setEventData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      category: '',
      maxAttendees: '',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create New Event</Text>

        {/* Event Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Event Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Beach Volleyball Meetup"
            placeholderTextColor="#666"
            value={eventData.title}
            onChangeText={(value) => handleInputChange('title', value)}
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell people about your event..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
            value={eventData.description}
            onChangeText={(value) => handleInputChange('description', value)}
          />
        </View>

        {/* Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date *</Text>
          <TextInput
            style={styles.input}
            placeholder="MM/DD/YYYY"
            placeholderTextColor="#666"
            value={eventData.date}
            onChangeText={(value) => handleInputChange('date', value)}
          />
        </View>

        {/* Time */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Time</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 7:00 PM"
            placeholderTextColor="#666"
            value={eventData.time}
            onChangeText={(value) => handleInputChange('time', value)}
          />
        </View>

        {/* Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Central Park, NYC"
            placeholderTextColor="#666"
            value={eventData.location}
            onChangeText={(value) => handleInputChange('location', value)}
          />
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Sports, Music, Networking"
            placeholderTextColor="#666"
            value={eventData.category}
            onChangeText={(value) => handleInputChange('category', value)}
          />
        </View>

        {/* Max Attendees */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Max Attendees</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 20"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={eventData.maxAttendees}
            onChangeText={(value) => handleInputChange('maxAttendees', value)}
          />
        </View>

        {/* Create Button */}
        <TouchableOpacity style={styles.createButton} onPress={handleCreateEvent}>
          <Text style={styles.createButtonText}>Create Event</Text>
        </TouchableOpacity>

        {/* Note */}
        <Text style={styles.note}>
          * Required fields. This is a dummy form - events aren't actually created.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#4455aa',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});