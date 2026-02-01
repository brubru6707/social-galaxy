import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useGrove } from '@/contexts/GroveContext';
import { useUser } from '@/contexts/UserContext';
import { Grove, GroveProfile, GROVE_PROFILE_IMAGES } from '@/assets/groves_data';
import mockData from '@/assets/mock_data.json';
import GroveProfileEditor from './grove-profile-editor';
import GroveSocialGalaxy from './grove-social-galaxy';

// Helper to get grove profile image source
const getGroveProfileImage = (userId: string, groveId: string, fallbackUri: string) => {
  const key = `${userId}_${groveId}` as keyof typeof GROVE_PROFILE_IMAGES;
  if (GROVE_PROFILE_IMAGES[key]) {
    return GROVE_PROFILE_IMAGES[key];
  }
  return { uri: fallbackUri };
};

const { width } = Dimensions.get('window');

interface GroveDetailProps {
  grove: Grove;
  onClose: () => void;
}

export default function GroveDetail({ grove, onClose }: GroveDetailProps) {
  const { isGroveMember, groveProgress, joinGrove, getGroveProfile, updateGroveProfile } = useGrove();
  const { allUsers, currentUser } = useUser();
  const [activeTab, setActiveTab] = useState<'members' | 'events' | 'galaxy' | 'profile'>('members');
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  
  const isMember = isGroveMember(grove.id);
  const progress = groveProgress[grove.id] || 0;
  const needed = grove.accessRules.minEventsAttended;
  const canJoin = progress >= needed && !isMember;
  
  const handleSaveProfile = (profile: GroveProfile) => {
    updateGroveProfile(profile);
  };
  
  // Get grove members
  const members = allUsers.filter(user => grove.members.includes(user.id));
  
  // Get grove exclusive events
  const exclusiveEvents = mockData.events.filter(event => 
    grove.exclusiveEvents.includes(event.id)
  );
  
  // Get user's grove profile
  const groveProfile = currentUser ? getGroveProfile(grove.id) : null;
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Grove Header */}
        <LinearGradient
          colors={[grove.color, grove.color + '60']}
          style={styles.groveHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.groveIconLarge}>
            <Text style={styles.groveEmojiLarge}>{grove.emoji}</Text>
          </View>
          <Text style={styles.groveName}>{grove.name}</Text>
          <Text style={styles.groveMemberCount}>{grove.memberCount} members</Text>
          
          {isMember && (
            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>You're a member</Text>
            </View>
          )}
          
          {!isMember && (
            <View style={styles.progressSection}>
              <View style={styles.progressBarLarge}>
                <View 
                  style={[
                    styles.progressBarFillLarge,
                    { width: `${Math.min((progress / needed) * 100, 100)}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {progress}/{needed} events attended
              </Text>
            </View>
          )}
        </LinearGradient>
        
        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionText}>{grove.description}</Text>
        </View>
        
        {/* Join Button */}
        {canJoin && (
          <TouchableOpacity 
            style={[styles.joinButton, { backgroundColor: grove.color }]}
            onPress={() => joinGrove(grove.id)}
          >
            <Text style={styles.joinButtonText}>Join {grove.name}</Text>
          </TouchableOpacity>
        )}
        
        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'members' && styles.tabActive]}
            onPress={() => setActiveTab('members')}
          >
            <Text style={[styles.tabText, activeTab === 'members' && styles.tabTextActive]}>
              Members
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'events' && styles.tabActive]}
            onPress={() => setActiveTab('events')}
          >
            <Text style={[styles.tabText, activeTab === 'events' && styles.tabTextActive]}>
              Events
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'galaxy' && styles.tabActive]}
            onPress={() => setActiveTab('galaxy')}
          >
            <Text style={[styles.tabText, activeTab === 'galaxy' && styles.tabTextActive]}>
              Galaxy
            </Text>
          </TouchableOpacity>
          {isMember && (
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'profile' && styles.tabActive]}
              onPress={() => setActiveTab('profile')}
            >
              <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
                My Profile
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Tab Content */}
        {activeTab === 'members' && (
          <View style={styles.membersSection}>
            <Text style={styles.sectionTitle}>
              {isMember ? 'Fellow Grove Members' : 'Grove Members'}
            </Text>
            {!isMember && (
              <View style={styles.lockedOverlay}>
                <Text style={styles.lockedText}>
                  Join the grove to see member profiles
                </Text>
              </View>
            )}
            <View style={styles.membersGrid}>
              {members.slice(0, isMember ? 20 : 6).map(member => (
                <View key={member.id} style={styles.memberCard}>
                  <Image 
                    source={{ uri: member.profile_picture }}
                    style={[styles.memberAvatar, !isMember && styles.blurred]}
                  />
                  <Text style={[styles.memberName, !isMember && styles.blurredText]}>
                    {isMember ? member.name.split(' ')[0] : '???'}
                  </Text>
                </View>
              ))}
            </View>
            {members.length > 6 && !isMember && (
              <Text style={styles.moreText}>
                +{members.length - 6} more members
              </Text>
            )}
          </View>
        )}
        
        {activeTab === 'events' && (
          <View style={styles.eventsSection}>
            <Text style={styles.sectionTitle}>Grove-Exclusive Events</Text>
            {exclusiveEvents.length === 0 ? (
              <View style={styles.noEventsState}>
                <Text style={styles.noEventsEmoji}>📅</Text>
                <Text style={styles.noEventsText}>No exclusive events right now</Text>
                <Text style={styles.noEventsSubtext}>
                  Check back soon for grove-only events
                </Text>
              </View>
            ) : (
              exclusiveEvents.map(event => (
                <TouchableOpacity key={event.id} style={styles.eventCard}>
                  <Image 
                    source={{ uri: event.event_picture }}
                    style={styles.eventImage}
                  />
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventLocation}>{event.location}</Text>
                    {!isMember && (
                      <View style={styles.eventLockBadge}>
                        <Text style={styles.eventLockText}>Members Only</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
        
        {activeTab === 'galaxy' && (
          <View style={styles.galaxySection}>
            <Text style={styles.sectionTitle}>
              {isMember ? 'Your Grove Connections' : 'Your Friends in this Grove'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {isMember 
                ? 'See how you connect with other grove members'
                : 'Discover your connections to this community'
              }
            </Text>
            <GroveSocialGalaxy
              grove={grove}
              currentUserId={currentUser?.id || ''}
              groveMembers={members}
            />
          </View>
        )}
        
        {activeTab === 'profile' && isMember && (
          <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>Your Grove Profile</Text>
            <Text style={styles.sectionSubtitle}>
              Customize how you appear to other {grove.name} members
            </Text>
            
            <View style={styles.profileCard}>
              <Image 
                source={getGroveProfileImage(
                  currentUser?.id || '', 
                  grove.id, 
                  currentUser?.profile_picture || ''
                )}
                style={styles.profileAvatar}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileDisplayName}>
                  {groveProfile?.displayName || currentUser?.name}
                </Text>
                <Text style={styles.profileBio}>
                  {groveProfile?.bio || currentUser?.bio || 'No grove-specific bio set'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={() => setShowProfileEditor(true)}
            >
              <Text style={styles.editProfileButtonText}>Edit Grove Profile</Text>
            </TouchableOpacity>
            
            <View style={styles.recentEventsSection}>
              <Text style={styles.recentEventsTitle}>Your Events in this Grove</Text>
              <Text style={styles.recentEventsSubtitle}>
                Events you've attended that match this community
              </Text>
              
              {currentUser?.events_gone_to?.slice(0, 3).map((event: any, index: number) => (
                <View key={index} style={styles.recentEventRow}>
                  <Image 
                    source={{ uri: event.event_picture }}
                    style={styles.recentEventImage}
                  />
                  <View style={styles.recentEventInfo}>
                    <Text style={styles.recentEventTitle}>
                      {event.title}
                    </Text>
                    <Text style={styles.recentEventLocation}>
                      {event.location}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
        
        <View style={{ height: 50 }} />
      </ScrollView>
      
      {/* Grove Profile Editor Modal */}
      <GroveProfileEditor
        grove={grove}
        visible={showProfileEditor}
        onClose={() => setShowProfileEditor(false)}
        onSave={handleSaveProfile}
      />
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
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  groveHeader: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  groveIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  groveEmojiLarge: {
    fontSize: 40,
  },
  groveName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  groveMemberCount: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  memberBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  memberBadgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  progressSection: {
    width: '100%',
    alignItems: 'center',
  },
  progressBarLarge: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFillLarge: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  progressText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionText: {
    color: '#9CA3AF',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  joinButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
  },
  tabText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
  },
  membersSection: {
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
    marginTop: -8,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  lockedText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  memberCard: {
    width: (width - 32 - 48) / 4,
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 16,
  },
  memberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
    backgroundColor: '#1F2937',
  },
  blurred: {
    opacity: 0.3,
  },
  memberName: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  blurredText: {
    color: '#6B7280',
  },
  moreText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  eventsSection: {},
  noEventsState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noEventsEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  noEventsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  noEventsSubtext: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  eventImage: {
    width: 80,
    height: 80,
  },
  eventInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  eventTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  eventLocation: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  eventLockBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(245,158,11,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  eventLockText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '600',
  },
  galaxySection: {
    marginTop: 8,
  },
  profileSection: {},
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileDisplayName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileBio: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  editProfileButton: {
    backgroundColor: '#374151',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  editProfileButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  recentEventsSection: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
  },
  recentEventsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  recentEventsSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 16,
  },
  recentEventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  recentEventImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  recentEventInfo: {
    flex: 1,
  },
  recentEventTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  recentEventLocation: {
    color: '#9CA3AF',
    fontSize: 12,
  },
});
