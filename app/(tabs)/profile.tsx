import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dummy user data
const dummyUser = {
  id: 'User 5',
  firstName: 'Alex',
  lastName: 'Johnson',
  profile_picture: "https://i.pravatar.cc/300?u='ALEX'",
  dateJoined: 'January 2024',
  mutuals: 24,
  bio: 'Adventure seeker, coffee lover, and tech enthusiast. Always up for a good conversation or a hike in the hills. Let\'s connect!',
  hotTakes: [
    { question: 'Morning vs Night', answer: 'Morning' },
    { question: 'Vim vs Emacs', answer: 'Vim' },
    { question: 'Pancakes vs Waffles', answer: 'Waffles' },
    { question: 'Tabs vs Spaces', answer: 'Spaces' },
    { question: 'TikTok vs Instagram', answer: 'TikTok' },
  ],
};

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with Gear Icon */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.gearButton}>
            <IconSymbol size={24} name="gear" color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Profile Picture */}
        <View style={styles.profilePictureContainer}>
          <Image source={{ uri: dummyUser.profile_picture }} style={styles.profilePicture} />
        </View>

        {/* Name */}
        <View style={styles.nameContainer}>
          <Text style={styles.firstName}>{dummyUser.firstName}</Text>
          <Text style={styles.lastName}>{dummyUser.lastName}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareButtonText}>Share Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Date Joined and Mutuals */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Joined</Text>
            <Text style={styles.infoValue}>{dummyUser.dateJoined}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Mutuals</Text>
            <Text style={styles.infoValue}>{dummyUser.mutuals}</Text>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.bioContainer}>
          <Text style={styles.bio}>{dummyUser.bio}</Text>
        </View>

        {/* Hot Take Questions */}
        <View style={styles.hotTakesContainer}>
          <Text style={styles.hotTakesTitle}>Hot Takes</Text>
          {dummyUser.hotTakes.map((take, index) => (
            <View key={index} style={styles.hotTakeItem}>
              <Text style={styles.hotTakeQuestion}>{take.question}</Text>
              <Text style={styles.hotTakeAnswer}>{take.answer}</Text>
            </View>
          ))}
        </View>
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
    alignItems: 'center',
  },
  header: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  gearButton: {
    padding: 10,
  },
  profilePictureContainer: {
    marginBottom: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  firstName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  lastName: {
    fontSize: 24,
    color: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  editButton: {
    backgroundColor: '#4455aa',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginRight: 15,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shareButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  bioContainer: {
    width: '100%',
    marginBottom: 30,
  },
  bio: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
    textAlign: 'center',
  },
  hotTakesContainer: {
    width: '100%',
  },
  hotTakesTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  hotTakeItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  hotTakeQuestion: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  hotTakeAnswer: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
  },
});