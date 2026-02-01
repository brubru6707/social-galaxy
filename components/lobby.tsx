import { useUser } from '@/contexts/UserContext';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getNemesisAndBestie } from './lobby-match-utils';
import { calculateMatchScore } from './social-galaxy';

// --- Types ---
export type UserType = {
  id: string;
  name: string;
  bio: string;
  dob: string;
  profile_picture: string;
  events_gone_to: any[];
  hot_take_answers: any[];
};

export function Lobby({ users, onClose }: { users: UserType[]; onClose: () => void }) {
  const { currentUser } = useUser();
  const { nemesis, bestie } = currentUser ? getNemesisAndBestie(currentUser, users) : { nemesis: null, bestie: null };
  const [searchQuery, setSearchQuery] = useState('');

  console.log('Lobby rendering with users:', users.length);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.bio.toLowerCase().includes(query)
    );
  }, [searchQuery, users]);

  if (!users || users.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No attendees found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>EVENT LOBBY</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>X</Text>
        </TouchableOpacity>
      </View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search people..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Results count */}
      {searchQuery.length > 0 && (
        <Text style={styles.resultsCount}>
          {filteredUsers.length} {filteredUsers.length === 1 ? 'result' : 'results'} found
        </Text>
      )}
      {/* Nemesis and Bestie Section */}
      <View style={styles.matchRow}>
        {nemesis && (
          <View style={[styles.matchCard, { backgroundColor: '#2A002A' }]}> {/* Pinkish for Nemesis */}
            <Text style={[styles.matchLabel, { color: '#FF5CB3' }]}>Nemesis</Text>
            <Image source={{ uri: nemesis.profile_picture }} style={styles.avatar} />
            <Text style={styles.matchName}>{nemesis.name}</Text>
            <Text style={[styles.matchScore, { color: '#FF5CB3' }]}>Match: {calculateMatchScore(currentUser, nemesis)}%</Text>
          </View>
        )}
        {bestie && (
          <View style={[styles.matchCard, { backgroundColor: '#002A1A' }]}> {/* Greenish for Bestie */}
            <Text style={[styles.matchLabel, { color: '#5CFFB3' }]}>Bestie</Text>
            <Image source={{ uri: bestie.profile_picture }} style={styles.avatar} />
            <Text style={styles.matchName}>{bestie.name}</Text>
            <Text style={[styles.matchScore, { color: '#5CFFB3' }]}>Match: {calculateMatchScore(currentUser, bestie)}%</Text>
          </View>
        )}
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredUsers.map((user) => (
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
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

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
  scrollContent: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#ccc',
    fontSize: 18,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 40, 0.95)',
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingVertical: 10,
  },
  clearButton: {
    padding: 6,
  },
  clearButtonText: {
    color: '#888',
    fontSize: 16,
  },
  resultsCount: {
    color: '#FFD700',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginVertical: 16,
  },
  matchCard: {
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    minWidth: 120,
    marginHorizontal: 8,
  },
  matchLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  matchName: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
  },
  matchScore: {
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 2,
  },
});