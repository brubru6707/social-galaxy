import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import GROVES from '@/assets/groves_data';

interface OtherProfileProps {
  user: any;
  onClose: () => void;
  groveContext?: string; // Optional grove context for filtered view
}

export default function OtherProfile({ user, onClose, groveContext }: OtherProfileProps) {
  // Get groves this user belongs to
  const userGroves = GROVES.filter(grove => grove.members.includes(user.id));
  
  // Get the active grove if in context
  const activeGrove = groveContext ? GROVES.find(g => g.id === groveContext) : null;
  
  // Determine what to show based on grove context
  const displayName = user.name;
  const displayBio = user.bio;
  const displayHotTakes = user.hot_take_answers || [];
  
  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Grove Context Banner */}
          {activeGrove && (
            <View style={[styles.groveContextBanner, { backgroundColor: activeGrove.color + '30' }]}>
              <Text style={styles.groveContextEmoji}>{activeGrove.emoji}</Text>
              <Text style={[styles.groveContextText, { color: activeGrove.color }]}>
                {activeGrove.name} Profile
              </Text>
            </View>
          )}
          
          <Image source={{ uri: user.profile_picture }} style={styles.profileImage} />
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.bio}>{displayBio}</Text>
          
          {/* Grove Badges */}
          {userGroves.length > 0 && !groveContext && (
            <View style={styles.groveBadgesContainer}>
              {userGroves.map(grove => (
                <View 
                  key={grove.id} 
                  style={[styles.groveBadge, { backgroundColor: grove.color + '30' }]}
                >
                  <Text style={styles.groveBadgeEmoji}>{grove.emoji}</Text>
                  <Text style={[styles.groveBadgeText, { color: grove.color }]}>
                    {grove.name.replace(' Grove', '')}
                  </Text>
                </View>
              ))}
            </View>
          )}
          
          <Text style={styles.sectionTitle}>
            {groveContext ? `Hot Takes` : 'Hot Takes'}
          </Text>
          {displayHotTakes.length > 0 ? (
            displayHotTakes.map((ht: any, idx: number) => (
              <View key={idx} style={styles.hotTake}>
                <Text style={styles.question}>{ht.question_text}</Text>
                <Text style={styles.answer}>{ht.selected_option || ht.answer}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.empty}>No hot takes found.</Text>
          )}
          
          <Text style={styles.sectionTitle}>Recent Events</Text>
          {user.events_gone_to && user.events_gone_to.length > 0 ? (
            user.events_gone_to.slice(0, 3).map((evt: any, idx: number) => (
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
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>Close</Text>
        </TouchableOpacity>
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
  groveContextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  groveContextEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  groveContextText: {
    fontSize: 14,
    fontWeight: '600',
  },
  groveBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 12,
  },
  groveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  groveBadgeEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  groveBadgeText: {
    fontSize: 11,
    fontWeight: '500',
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
