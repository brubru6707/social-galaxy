import DraggableStickerEmoji from '@/components/Profile/DraggableStickerEmoji';
import ProfileInfo from '@/components/Profile/ProfileInfo';
import ShareProfileCard from '@/components/ShareProfileCard';
import { useUser } from '@/contexts/UserContext';
import React, { useRef, useState } from 'react';
import { Animated, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import stickersData from '../../assets/stickers.json';
import AnimatedLiquidGradient from '../../components/AnimatedLiquidGradient';
import { getDisplayName } from '../../utils/displayNames';

export default function ProfileScreen() {
  const { currentUser, stickerPositions, updateStickerPosition, stickerZIndexes, updateStickerZIndex } = useUser();
  const scrollViewRef = useRef<ScrollView>(null);
  const profileCaptureRef = useRef<View>(null);
  const rootCaptureRef = useRef<View>(null);
  const [showShareCard, setShowShareCard] = useState(false);
  const gestureStartPositions = useRef<{[key: number]: {x: number, y: number}}>({});
  const emojiAnimValues = useRef<{[key: number]: {translateX: Animated.Value, translateY: Animated.Value, scale: Animated.Value}}>({});
  const maxZIndex = useRef(1000);

  // Initialize animated values from persisted positions
  React.useEffect(() => {
    console.log('[Profile] Initializing sticker positions from context:', stickerPositions);
    Object.keys(stickerPositions).forEach(indexStr => {
      const index = parseInt(indexStr);
      const anim = getEmojiAnim(index);
      const pos = stickerPositions[index];
      if (pos) {
        console.log(`[Profile] Setting position for sticker ${index}:`, pos);
        anim.translateX.setValue(pos.x);
        anim.translateY.setValue(pos.y);
        if (pos.scale) {
          anim.scale.setValue(pos.scale);
        }
      }
    });
  }, [stickerPositions]);

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

  // Bring sticker to front when touched
  const bringToFront = (index: number) => {
    maxZIndex.current += 1;
    console.log(`[Profile] Bringing sticker ${index} to front with zIndex: ${maxZIndex.current}`);
    updateStickerZIndex(index, maxZIndex.current);
  };

  // Map currentUser data to the expected format
  const userData = {
    id: currentUser?.id || 'Unknown',
    firstName: currentUser?.name || 'User',
    lastName: '',
    profile_picture: currentUser?.profile_picture || "https://i.pravatar.cc/300?u='USER'",
    dateJoined: currentUser?.joined ?
      (() => {
        const date = new Date(currentUser.joined);
        if (isNaN(date.getTime())) return 'Unknown';
        return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      })()
      : 'Unknown',
    mutuals: currentUser?.mutuals?.length || 0,
    bio: currentUser?.bio || 'No bio available',
    hotTakes: currentUser?.hot_take_answers?.map((take: any) => ({
      question: take.question_text || 'Unknown question',
      answer: take.answer ?? take.selected_option ?? 'No answer'
    })) || [],
  };


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
        {/* Profile Info Section (modularized) */}
        <ProfileInfo userData={userData} onShare={handleShare} onEdit={handleEdit} />

        {/* Hot Take Questions */}
        <View style={styles.hotTakesContainer}>
          <Text style={styles.hotTakesTitle}>Hot Takes</Text>
          {userData.hotTakes.map((take, index) => {
            const emojiAnim = getEmojiAnim(index);
            return (
              <View key={index} style={styles.hotTakeItem}>
                <Text style={styles.hotTakeQuestion}>{take.question.split(' vs ').map((part: string) => getDisplayName(part.trim())).join(' vs ')}</Text>
                <View style={styles.hotTakeAnswerContainer}>
                  <Text style={styles.hotTakeAnswer}>{getDisplayName(take.answer)}</Text>
                  <DraggableStickerEmoji
                    index={index}
                    emojiAnim={emojiAnim}
                    getAnswerEmoji={() => getAnswerEmoji(take.answer)}
                    gestureStartPositions={gestureStartPositions}
                    setEmojiPositions={updateStickerPosition}
                    zIndex={stickerZIndexes[index] || 1000 + index}
                    onBringToFront={bringToFront}
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