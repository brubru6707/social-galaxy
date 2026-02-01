import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getDisplayName } from '../utils/displayNames';

export default function OtherProfile({ user, onClose }: { user: any, onClose: () => void }) {
  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <ScrollView contentContainerStyle={styles.content}>
          <Image source={{ uri: user.profile_picture }} style={styles.profileImage} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.bio}>{user.bio}</Text>
          <Text style={styles.sectionTitle}>Hot Takes</Text>
          {user.hot_take_answers && user.hot_take_answers.length > 0 ? (
            user.hot_take_answers.map((ht: any, idx: number) => (
              <View key={idx} style={styles.hotTake}>
                <Text style={styles.question}>{ht.question_text}</Text>
                <Text style={styles.answer}>{getDisplayName(ht.selected_option || ht.answer)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.empty}>No hot takes found.</Text>
          )}
          <Text style={styles.sectionTitle}>Recent Events</Text>
          {user.events_gone_to && user.events_gone_to.length > 0 ? (
            user.events_gone_to.map((evt: any, idx: number) => (
              <View key={idx} style={styles.eventCard}>
                <Image source={{ uri: evt.event_picture }} style={styles.eventImage} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle}>{evt.title}</Text>
                  <Text style={styles.eventInfo}>{evt.location}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.empty}>No recent events found.</Text>
          )}
        </ScrollView>
        <Text style={styles.closeButton} onPress={onClose}>Close</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modal: {
    backgroundColor: '#181818',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '85%',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  bio: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  hotTake: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    width: '100%',
  },
  question: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  answer: {
    color: '#FFD700',
    fontSize: 15,
    marginTop: 2,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    width: '100%',
  },
  eventImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  eventTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  eventInfo: {
    color: '#ccc',
    fontSize: 14,
  },
  empty: {
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  closeButton: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 10,
    alignSelf: 'center',
    padding: 10,
  },
});
