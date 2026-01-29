import { useUser } from '@/contexts/UserContext';
import React from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dummy data
const recentActivities = [
  { id: 1, type: 'connection', message: 'You matched with Sarah!', time: '2h ago' },
  { id: 2, type: 'event', message: 'Beach Volleyball event created', time: '5h ago' },
  { id: 3, type: 'profile', message: 'Alex viewed your profile', time: '1d ago' },
];

const featuredUsers = [
  { id: 1, name: 'Emma', matchScore: 92, avatar: 'https://via.placeholder.com/60x60/FF69B4/FFFFFF?text=E' },
  { id: 2, name: 'Mike', matchScore: 87, avatar: 'https://via.placeholder.com/60x60/4169E1/FFFFFF?text=M' },
  { id: 3, name: 'Lisa', matchScore: 95, avatar: 'https://via.placeholder.com/60x60/32CD32/FFFFFF?text=L' },
];

export default function HomeScreen() {
  const { currentUser } = useUser();
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back, {currentUser?.name || 'User'}!</Text>
          <Text style={styles.subtitle}>Discover your social galaxy</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>47</Text>
            <Text style={styles.statLabel}>Connections</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>89%</Text>
            <Text style={styles.statLabel}>Match Rate</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Explore Galaxy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Create Event</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Matches</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
            {featuredUsers.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userMatch}>{user.matchScore}% match</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivities.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <Text style={styles.activityMessage}>{activity.message}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          ))}
        </View>

        {/* Motivational Quote */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quote}>"In the galaxy of life, connections are the stars that light our way."</Text>
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
  },
  header: {
    marginBottom: 30,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#ccc',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#ccc',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#4455aa',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  featuredScroll: {
    marginBottom: 10,
  },
  userCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginRight: 15,
    width: 100,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userMatch: {
    fontSize: 12,
    color: '#FFD700',
  },
  activityItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityMessage: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  quoteContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  quote: {
    fontSize: 18,
    color: '#FFD700',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});