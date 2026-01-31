import DraggableStickerEmoji from '@/components/Profile/DraggableStickerEmoji';
import ProfileInfo from '@/components/Profile/ProfileInfo';
import ShareProfileCard from '@/components/ShareProfileCard';
import { useUser } from '@/contexts/UserContext';
import { useGrove } from '@/contexts/GroveContext';
import React, { useRef, useState } from 'react';
import { Animated, Modal, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import stickersData from '../../assets/stickers.json';
import AnimatedLiquidGradient from '../../components/AnimatedLiquidGradient';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const { currentUser } = useUser();
  const { userGroves, activeGroveContext, setActiveGroveContext, getGroveProfile } = useGrove();
  const scrollViewRef = useRef<ScrollView>(null);
  const profileCaptureRef = useRef<View>(null);
  const rootCaptureRef = useRef<View>(null);
  const [emojiPositions, setEmojiPositions] = useState<{[key: number]: {x: number, y: number}}>({});
  const [showShareCard, setShowShareCard] = useState(false);
  const gestureStartPositions = useRef<{[key: number]: {x: number, y: number}}>({});
  const emojiAnimValues = useRef<{[key: number]: {translateX: Animated.Value, translateY: Animated.Value, scale: Animated.Value}}>({});
  
  // Get grove-specific profile if in grove context
  const groveProfile = activeGroveContext ? getGroveProfile(activeGroveContext) : null;
  const activeGrove = userGroves.find(g => g.id === activeGroveContext);

  // Debug: log when emojiPositions changes
  React.useEffect(() => {
    console.log('[DEBUG] emojiPositions changed:', emojiPositions);
    // Sync Animated values with state
    Object.keys(emojiPositions).forEach(indexStr => {
      const index = parseInt(indexStr);
      const anim = getEmojiAnim(index);
      const pos = emojiPositions[index];
      if (pos) {
        anim.translateX.setValue(pos.x);
        anim.translateY.setValue(pos.y);
      }
    });
  }, [emojiPositions]);

    // Stickers with index signature for type safety
    const stickers: Record<string, string> = stickersData;
    // Function to get emoji based on answer
    const getAnswerEmoji = (answer: string) => {
      return stickers[answer] || '⭐';
    };

  // Get or create animated values for emoji at index
  const getEmojiAnim = (index: number) => {
    if (!emojiAnimValues.current[index]) {
      console.log(`[DEBUG] Creating new anim values for emoji ${index}`);
      emojiAnimValues.current[index] = {
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        scale: new Animated.Value(1)
      };
    }
    return emojiAnimValues.current[index];
  };

  // Map currentUser data to the expected format, with grove overrides if in context
  const userData = {
    id: currentUser?.id || 'Unknown',
    firstName: groveProfile?.displayName || currentUser?.name || 'User',
    lastName: '',
    profile_picture: groveProfile?.profilePicture || currentUser?.profile_picture || "https://i.pravatar.cc/300?u='USER'",
    dateJoined: currentUser?.dob || 'Unknown',
    mutuals: currentUser?.mutuals?.length || 0,
    bio: groveProfile?.bio || currentUser?.bio || 'No bio available',
    hotTakes: currentUser?.hot_take_answers?.map((take: any) => ({
      question: take.question_text || 'Unknown question',
      answer: take.answer ?? take.selected_option ?? 'No answer',
      questionId: take.question_id,
    })) || [],
  };
  
  // Filter hot takes if in grove context
  const filteredHotTakes = activeGroveContext && groveProfile?.visibleHotTakes
    ? userData.hotTakes.filter((take: any) => groveProfile.visibleHotTakes.includes(take.questionId))
    : userData.hotTakes;


  // Derive user stickers from hot take answers
  const userStickers = userData.hotTakes.map((take: { answer: string }) => getAnswerEmoji(take.answer));

  // Share and Edit handlers
  const handleShare = () => {
    setShowShareCard(true);
  };

  const handleEdit = () => {
    // TODO: Implement edit profile navigation/modal
    alert('Edit Profile feature coming soon!');
  };

  return (
    <SafeAreaView style={styles.container} ref={rootCaptureRef}>
      <AnimatedLiquidGradient />
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Grove Context Selector */}
        {userGroves.length > 0 && (
          <View style={styles.groveContextSection}>
            <Text style={styles.groveContextLabel}>Viewing as:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.groveContextScroll}
            >
              <TouchableOpacity
                style={[
                  styles.groveContextChip,
                  !activeGroveContext && styles.groveContextChipActive
                ]}
                onPress={() => setActiveGroveContext(null)}
              >
                <Text style={[
                  styles.groveContextChipText,
                  !activeGroveContext && styles.groveContextChipTextActive
                ]}>
                  Full Profile
                </Text>
              </TouchableOpacity>
              
              {userGroves.map(grove => (
                <TouchableOpacity
                  key={grove.id}
                  style={[
                    styles.groveContextChip,
                    activeGroveContext === grove.id && styles.groveContextChipActive,
                    { borderColor: grove.color }
                  ]}
                  onPress={() => setActiveGroveContext(
                    activeGroveContext === grove.id ? null : grove.id
                  )}
                >
                  <Text style={styles.groveContextEmoji}>{grove.emoji}</Text>
                  <Text style={[
                    styles.groveContextChipText,
                    activeGroveContext === grove.id && styles.groveContextChipTextActive
                  ]}>
                    {grove.name.replace(' Grove', '')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Active Grove Context Banner */}
        {activeGrove && (
          <LinearGradient
            colors={[activeGrove.color + '40', activeGrove.color + '10']}
            style={styles.groveContextBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.groveContextBannerEmoji}>{activeGrove.emoji}</Text>
            <View style={styles.groveContextBannerInfo}>
              <Text style={styles.groveContextBannerTitle}>
                Viewing as {activeGrove.name} member
              </Text>
              <Text style={styles.groveContextBannerSubtitle}>
                This is how other {activeGrove.name} members see your profile
              </Text>
            </View>
          </LinearGradient>
        )}
        
        {/* Profile Info Section (modularized) */}
        <ProfileInfo userData={userData} onShare={handleShare} onEdit={handleEdit} />
        
        {/* Grove Badges */}
        {userGroves.length > 0 && !activeGroveContext && (
          <View style={styles.groveBadgesSection}>
            <Text style={styles.groveBadgesSectionTitle}>My Groves</Text>
            <View style={styles.groveBadgesRow}>
              {userGroves.map(grove => (
                <View 
                  key={grove.id} 
                  style={[styles.groveBadge, { backgroundColor: grove.color + '30' }]}
                >
                  <Text style={styles.groveBadgeEmoji}>{grove.emoji}</Text>
                  <Text style={[styles.groveBadgeText, { color: grove.color }]}>
                    {grove.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Hot Take Questions */}
        <View style={styles.hotTakesContainer}>
          <Text style={styles.hotTakesTitle}>
            {activeGroveContext ? `Hot Takes (${activeGrove?.name})` : 'Hot Takes'}
          </Text>
          {activeGroveContext && filteredHotTakes.length === 0 && (
            <View style={styles.noHotTakesState}>
              <Text style={styles.noHotTakesText}>
                No hot takes selected for this grove
              </Text>
              <Text style={styles.noHotTakesSubtext}>
                Edit your grove profile to choose which hot takes to show
              </Text>
            </View>
          )}
          {filteredHotTakes.map((take: any, index: number) => {
            const emojiAnim = getEmojiAnim(index);
            return (
              <View key={index} style={styles.hotTakeItem}>
                <Text style={styles.hotTakeQuestion}>{take.question}</Text>
                <View style={styles.hotTakeAnswerContainer}>
                  <Text style={styles.hotTakeAnswer}>{take.answer}</Text>
                  <DraggableStickerEmoji
                    index={index}
                    emojiAnim={emojiAnim}
                    getAnswerEmoji={() => getAnswerEmoji(take.answer)}
                    gestureStartPositions={gestureStartPositions}
                    setEmojiPositions={setEmojiPositions}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Share Profile Card Modal */}
      <Modal 
        visible={showShareCard} 
        transparent 
        animationType="fade" 
        onRequestClose={() => setShowShareCard(false)}
      >
        <ShareProfileCard
          profilePicture={userData.profile_picture}
          name={userData.firstName}
          stickers={userStickers}
          onClose={() => setShowShareCard(false)}
        />
      </Modal>
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
  groveContextSection: {
    width: '100%',
    marginBottom: 16,
  },
  groveContextLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 8,
  },
  groveContextScroll: {
    gap: 8,
  },
  groveContextChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    marginRight: 8,
  },
  groveContextChipActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  groveContextChipText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },
  groveContextChipTextActive: {
    color: '#000',
  },
  groveContextEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  groveContextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  groveContextBannerEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  groveContextBannerInfo: {
    flex: 1,
  },
  groveContextBannerTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  groveContextBannerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  groveBadgesSection: {
    width: '100%',
    marginBottom: 20,
  },
  groveBadgesSectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  groveBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  groveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  groveBadgeEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  groveBadgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  noHotTakesState: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  noHotTakesText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 4,
  },
  noHotTakesSubtext: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
  },
  profileContainer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  gearButton: {
    position: 'absolute',
    top: 0,
    right: 0,
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
  hotTakeAnswerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    minHeight: 40, // Give space for dragging
  },
  hotTakeAnswer: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
    flex: 1,
  },
  draggableEmoji: {
    // No absolute positioning, allow dragging in place
  },
stickerEmoji: {
  fontSize: 30,
  marginLeft: 10,
  // The 'textShadow' acts as the immediate "rim" light
  textShadowColor: '#FFFFFF', 
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 4, 
  
  // The 'shadow' properties act as the outer environmental glow
  shadowColor: '#474643ff', 
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 1,
  shadowRadius: 12, 
  
  // Optional: In SPM, shiny objects often looked slightly "raised"
  elevation: 10, 
},
});