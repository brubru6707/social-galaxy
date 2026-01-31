import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useGrove } from '@/contexts/GroveContext';
import { useUser } from '@/contexts/UserContext';
import { Grove } from '@/assets/groves_data';
import GroveDetail from '@/components/grove-detail';
import GroveUnlockModal from '@/components/grove-unlock-modal';

const { width } = Dimensions.get('window');

export default function GrovesScreen() {
  const {
    userGroves,
    pendingGroves,
    discoveryGroves,
    groveProgress,
    newlyUnlockedGrove,
    clearUnlockedGrove,
  } = useGrove();
  
  const [selectedGrove, setSelectedGrove] = useState<Grove | null>(null);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Groves</Text>
          <Text style={styles.subtitle}>
            Niche communities you've unlocked through event attendance
          </Text>
        </View>
        
        {/* Your Groves Section */}
        {userGroves.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Member of {userGroves.length} Groves</Text>
            <View style={styles.grovesGrid}>
              {userGroves.map(grove => (
                <GroveCard
                  key={grove.id}
                  grove={grove}
                  status="member"
                  progress={groveProgress[grove.id] || 0}
                  onPress={() => setSelectedGrove(grove)}
                />
              ))}
            </View>
          </View>
        )}
        
        {/* Empty State for New Users */}
        {userGroves.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyTitle}>No Groves Yet</Text>
            <Text style={styles.emptySubtitle}>
              Attend events to unlock niche communities and connect with like-minded people
            </Text>
          </View>
        )}
        
        {/* Almost There Section */}
        {pendingGroves.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Almost There</Text>
            <Text style={styles.sectionSubtitle}>
              Attend more events to unlock these groves
            </Text>
            <View style={styles.grovesGrid}>
              {pendingGroves.map(grove => (
                <GroveCard
                  key={grove.id}
                  grove={grove}
                  status="pending"
                  progress={groveProgress[grove.id] || 0}
                  onPress={() => setSelectedGrove(grove)}
                />
              ))}
            </View>
          </View>
        )}
        
        {/* Discover Section */}
        {discoveryGroves.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Discover</Text>
            <Text style={styles.sectionSubtitle}>
              Explore new communities
            </Text>
            <View style={styles.grovesGrid}>
              {discoveryGroves.map(grove => (
                <GroveCard
                  key={grove.id}
                  grove={grove}
                  status="locked"
                  progress={0}
                  onPress={() => setSelectedGrove(grove)}
                />
              ))}
            </View>
          </View>
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>
      
      {/* Grove Detail Modal */}
      <Modal
        visible={selectedGrove !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedGrove(null)}
      >
        {selectedGrove && (
          <GroveDetail
            grove={selectedGrove}
            onClose={() => setSelectedGrove(null)}
          />
        )}
      </Modal>
      
      {/* Unlock Celebration Modal */}
      <GroveUnlockModal
        grove={newlyUnlockedGrove}
        onClose={clearUnlockedGrove}
      />
    </SafeAreaView>
  );
}

interface GroveCardProps {
  grove: Grove;
  status: 'member' | 'pending' | 'locked';
  progress: number;
  onPress: () => void;
}

function GroveCard({ grove, status, progress, onPress }: GroveCardProps) {
  const needed = grove.accessRules.minEventsAttended;
  const progressPercent = Math.min((progress / needed) * 100, 100);
  
  return (
    <TouchableOpacity 
      style={styles.groveCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[grove.color + '40', grove.color + '10']}
        style={styles.groveCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Status Badge */}
        {status === 'member' && (
          <View style={[styles.statusBadge, { backgroundColor: '#10B981' }]}>
            <Text style={styles.statusBadgeText}>Member</Text>
          </View>
        )}
        {status === 'pending' && (
          <View style={[styles.statusBadge, { backgroundColor: '#F59E0B' }]}>
            <Text style={styles.statusBadgeText}>{progress}/{needed}</Text>
          </View>
        )}
        {status === 'locked' && (
          <View style={[styles.statusBadge, { backgroundColor: '#6B7280' }]}>
            <Text style={styles.statusBadgeText}>Locked</Text>
          </View>
        )}
        
        {/* Grove Icon */}
        <View style={[styles.groveIcon, { backgroundColor: grove.color + '30' }]}>
          <Text style={styles.groveEmoji}>{grove.emoji}</Text>
        </View>
        
        {/* Grove Info */}
        <Text style={styles.groveName}>{grove.name}</Text>
        <Text style={styles.groveMemberCount}>
          {grove.memberCount} members
        </Text>
        
        {/* Progress Bar for Pending */}
        {status === 'pending' && (
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${progressPercent}%`, backgroundColor: grove.color }
                ]} 
              />
            </View>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  header: {
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  grovesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  groveCard: {
    width: (width - 32 - 12) / 2,
    marginHorizontal: 6,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  groveCardGradient: {
    padding: 16,
    minHeight: 160,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  groveIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  groveEmoji: {
    fontSize: 28,
  },
  groveName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  groveMemberCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  progressBarContainer: {
    marginTop: 12,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
});
