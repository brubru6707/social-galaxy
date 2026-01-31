import { IconSymbol } from '@/components/ui/icon-symbol';
import { useUser } from '@/contexts/UserContext';
import * as Sharing from 'expo-sharing';
import React, { useRef, useState } from 'react';
import { Animated, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import stickers from '../../assets/stickers.json';
import AnimatedLiquidGradient from '../../components/AnimatedLiquidGradient';

export default function ProfileScreen() {
  const { currentUser } = useUser();
  const scrollViewRef = useRef<ScrollView>(null);
  const profileCaptureRef = useRef<View>(null);
  const rootCaptureRef = useRef<View>(null);
  const [emojiPositions, setEmojiPositions] = useState<{[key: number]: {x: number, y: number}}>({});
  const gestureStartPositions = useRef<{[key: number]: {x: number, y: number}}>({});
  const emojiAnimValues = useRef<{[key: number]: {translateX: Animated.Value, translateY: Animated.Value, scale: Animated.Value}}>({});

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

  // Map currentUser data to the expected format
  const userData = {
    id: currentUser?.id || 'Unknown',
    firstName: currentUser?.name || 'User',
    lastName: '',
    profile_picture: currentUser?.profile_picture || "https://i.pravatar.cc/300?u='USER'",
    dateJoined: currentUser?.dob || 'Unknown',
    mutuals: currentUser?.events_gone_to?.length || 0,
    bio: currentUser?.bio || 'No bio available',
    hotTakes: currentUser?.hot_take_answers?.map((take: any) => ({
      question: take.question_text || 'Unknown question',
      answer: take.answer ?? take.selected_option ?? 'No answer'
    })) || [],
  };

  return (
    <SafeAreaView style={styles.container} ref={rootCaptureRef}>
      <AnimatedLiquidGradient />
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Everything above Hot Takes */}
        <View collapsable={false} style={{backgroundColor: 'transparent'}}>
          <View style={styles.profileContainer}>
            {/* Gear Icon at top right */}
            <TouchableOpacity style={styles.gearButton}>
              <IconSymbol size={24} name="gear" color="#fff" />
            </TouchableOpacity>

            {/* Profile Picture */}
            <View style={styles.profilePictureContainer}>
              <Image source={{ uri: userData.profile_picture }} style={styles.profilePicture} />
            </View>

            {/* Name */}
            <View style={styles.nameContainer}>
              <Text style={styles.firstName}>{userData.firstName}</Text>
              <Text style={styles.lastName}>{userData.lastName}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton} onPress={async () => {
                try {
                  const uri = await captureRef(rootCaptureRef, {
                    format: 'png',
                    quality: 1,
                  });
                  if (Platform.OS === 'web') {
                    const link = document.createElement('a');
                    link.href = uri;
                    link.download = 'profile.png';
                    link.click();
                  } else {
                    await Sharing.shareAsync(uri);
                  }
                } catch (e) {
                  alert('Failed to share profile: ' + e);
                }
              }}>
                <Text style={styles.shareButtonText}>Share Profile</Text>
              </TouchableOpacity>
            </View>

            {/* Date Joined and Mutuals */}
            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Joined</Text>
                <Text style={styles.infoValue}>{userData.dateJoined}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Mutuals</Text>
                <Text style={styles.infoValue}>{userData.mutuals}</Text>
              </View>
            </View>

            {/* Bio Section */}
            <View style={styles.bioContainer}>
              <Text style={styles.bio}>{userData.bio}</Text>
            </View>
          </View>
        </View>

        {/* Hot Take Questions */}
        <View style={styles.hotTakesContainer}>
          <Text style={styles.hotTakesTitle}>Hot Takes</Text>
          {userData.hotTakes.map((take, index) => {
            const emojiAnim = getEmojiAnim(index);
            return (
              <View key={index} style={styles.hotTakeItem}>
                <Text style={styles.hotTakeQuestion}>{take.question}</Text>
                <View style={styles.hotTakeAnswerContainer}>
                  <Text style={styles.hotTakeAnswer}>{take.answer}</Text>
                  <PanGestureHandler
                    minDurationMs={500} // Require long press to activate drag
                    activeOffsetX={[-10, 10]}
                    activeOffsetY={[-10, 10]}
                    simultaneousHandlers={[]}
                      onGestureEvent={Animated.event(
                        [],
                        {
                          useNativeDriver: false,
                          listener: (event) => {
                            console.log(`[DEBUG] Emoji ${index} gesture - translationX: ${event.nativeEvent.translationX}, translationY: ${event.nativeEvent.translationY}`);
                            const startPos = gestureStartPositions.current[index] || { x: 0, y: 0 };
                            console.log(`[DEBUG] Emoji ${index} using startPos x: ${startPos.x}, y: ${startPos.y}`);
                            const anim = getEmojiAnim(index);
                            // Update animated values based on start position + current translation
                            anim.translateX.setValue(startPos.x + event.nativeEvent.translationX);
                            anim.translateY.setValue(startPos.y + event.nativeEvent.translationY);
                            // Also update state for persistence
                            setEmojiPositions(prev => ({
                              ...prev,
                              [index]: {
                                x: startPos.x + event.nativeEvent.translationX,
                                y: startPos.y + event.nativeEvent.translationY,
                              }
                            }));
                          }
                        }
                      )}
                      onHandlerStateChange={(event) => {
                        console.log(`[DEBUG] Emoji ${index} state change - state: ${event.nativeEvent.state}`);
                        if (event.nativeEvent.state === State.BEGAN) {
                          console.log(`[DEBUG] Emoji ${index} drag BEGAN - current position x: ${getEmojiAnim(index).translateX._value}, y: ${getEmojiAnim(index).translateY._value}`);
                          // Store the current position as the gesture start position
                          gestureStartPositions.current[index] = {
                            x: getEmojiAnim(index).translateX._value,
                            y: getEmojiAnim(index).translateY._value,
                          };
                          console.log(`[DEBUG] Emoji ${index} gesture start position set to x: ${gestureStartPositions.current[index].x}, y: ${gestureStartPositions.current[index].y}`);
                          Animated.spring(getEmojiAnim(index).scale, {
                            toValue: 1.5,
                            useNativeDriver: false,
                          }).start();
                        } else if (
                          event.nativeEvent.state === State.END ||
                          event.nativeEvent.state === State.CANCELLED ||
                          event.nativeEvent.state === State.FAILED
                        ) {
                          console.log(`[DEBUG] Emoji ${index} drag ENDED - final position x: ${getEmojiAnim(index).translateX._value}, y: ${getEmojiAnim(index).translateY._value}`);
                          Animated.spring(getEmojiAnim(index).scale, {
                            toValue: 1,
                            useNativeDriver: false,
                          }).start();
                        }
                      }}
                  >
                    <Animated.View
                      style={[
                        styles.draggableEmoji,
                        {
                          transform: [
                            { translateX: getEmojiAnim(index).translateX },
                            { translateY: getEmojiAnim(index).translateY },
                            { scale: getEmojiAnim(index).scale }
                          ],
                          zIndex: 9999,
                          elevation: 9999,
                        }
                      ]}
                    >
                      <Text style={styles.stickerEmoji}>{getAnswerEmoji(take.answer)}</Text>
                    </Animated.View>
                  </PanGestureHandler>
                </View>
              </View>
            );
          })}
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
  },
});