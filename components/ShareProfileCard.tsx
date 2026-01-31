import EmojiShimmer from '@/components/Profile/Shimmer';
import * as Sharing from 'expo-sharing';
import React, { useMemo, useRef, useState } from 'react';
import { Animated, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { captureRef } from 'react-native-view-shot';

type ShareProfileCardProps = {
  profilePicture: string;
  name: string;
  stickers: string[]; // Array of emoji strings
  onClose: () => void;
};

// Card dimensions
const CARD_WIDTH = 300;
const CARD_HEIGHT = 350;
const STICKER_SIZE = 40;
const PROFILE_ICON_RADIUS = 70; // Profile icon (100px) + padding to avoid overlap

// Background color options
const BACKGROUND_COLORS = [
  '#ECCBC9',
  '#B1E6F3',
  '#ECD2E0',
  '#B2FBA5',
  '#FF964F',
  '#FFFFFF',
  '#000000',
];

// Helper to determine if a color is light (for text contrast)
const isLightColor = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};

export default function ShareProfileCard({ 
  profilePicture, 
  name, 
  stickers, 
  onClose 
}: ShareProfileCardProps) {
  const cardRef = useRef<View>(null);
  const [selectedBgColor, setSelectedBgColor] = useState(BACKGROUND_COLORS[0]);

  // Generate initial random positions for stickers
  const initialPositions = useMemo(() => {
    const positions: { x: number; y: number }[] = [];
    const padding = 20;
    
    const minX = -CARD_WIDTH / 2 + padding + STICKER_SIZE / 2;
    const maxX = CARD_WIDTH / 2 - padding - STICKER_SIZE / 2;
    const minY = -CARD_HEIGHT / 2 + padding + STICKER_SIZE / 2;
    const maxY = CARD_HEIGHT / 2 - padding - STICKER_SIZE / 2 - 40;

    const isOverlappingCenter = (x: number, y: number) => {
      const distance = Math.sqrt(x * x + y * y);
      return distance < PROFILE_ICON_RADIUS;
    };

    const isOverlappingOther = (x: number, y: number, existingPositions: { x: number; y: number }[]) => {
      for (const pos of existingPositions) {
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (distance < STICKER_SIZE + 5) return true;
      }
      return false;
    };

    for (let i = 0; i < stickers.length; i++) {
      let x: number, y: number;
      let attempts = 0;
      const maxAttempts = 100;

      do {
        x = minX + Math.random() * (maxX - minX);
        y = minY + Math.random() * (maxY - minY);
        attempts++;
      } while (
        (isOverlappingCenter(x, y) || isOverlappingOther(x, y, positions)) && 
        attempts < maxAttempts
      );

      positions.push({ x, y });
    }

    return positions;
  }, [stickers.length]);

  // Track current sticker positions (can be updated by dragging)
  const [stickerPositions, setStickerPositions] = useState<{ [key: number]: { x: number; y: number } }>({});
  
  // Animated values for each sticker
  const stickerAnimValues = useRef<{ [key: number]: { translateX: Animated.Value; translateY: Animated.Value; scale: Animated.Value } }>({});
  const gestureStartPositions = useRef<{ [key: number]: { x: number; y: number } }>({});

  // Get or create animated values for a sticker
  const getStickerAnim = (index: number) => {
    if (!stickerAnimValues.current[index]) {
      const initialPos = initialPositions[index] || { x: 0, y: 0 };
      stickerAnimValues.current[index] = {
        translateX: new Animated.Value(initialPos.x),
        translateY: new Animated.Value(initialPos.y),
        scale: new Animated.Value(1),
      };
    }
    return stickerAnimValues.current[index];
  };

  const handleShare = async () => {
    try {
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
      });
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri;
        link.download = 'profile-card.png';
        link.click();
      } else {
        await Sharing.shareAsync(uri);
      }
    } catch (e) {
      alert('Failed to share: ' + e);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Capturable Card */}
        <View ref={cardRef} style={[styles.card, { backgroundColor: selectedBgColor }]} collapsable={false}>
          {/* Draggable stickers */}
          <View style={styles.stickersContainer}>
            {stickers.map((emoji, index) => {
              const anim = getStickerAnim(index);
              return (
                <PanGestureHandler
                  key={index}
                  onGestureEvent={Animated.event(
                    [],
                    {
                      useNativeDriver: false,
                      listener: (event: any) => {
                        const startPos = gestureStartPositions.current[index] || initialPositions[index] || { x: 0, y: 0 };
                        const newX = startPos.x + event.nativeEvent.translationX;
                        const newY = startPos.y + event.nativeEvent.translationY;
                        anim.translateX.setValue(newX);
                        anim.translateY.setValue(newY);
                        setStickerPositions((prev) => ({
                          ...prev,
                          [index]: { x: newX, y: newY },
                        }));
                      },
                    }
                  )}
                  onHandlerStateChange={(event) => {
                    if (event.nativeEvent.state === State.BEGAN) {
                      gestureStartPositions.current[index] = {
                        x: (anim.translateX as any)._value,
                        y: (anim.translateY as any)._value,
                      };
                      Animated.spring(anim.scale, {
                        toValue: 1.3,
                        useNativeDriver: false,
                      }).start();
                    } else if (
                      event.nativeEvent.state === State.END ||
                      event.nativeEvent.state === State.CANCELLED ||
                      event.nativeEvent.state === State.FAILED
                    ) {
                      Animated.spring(anim.scale, {
                        toValue: 1,
                        useNativeDriver: false,
                      }).start();
                    }
                  }}
                >
                  <Animated.View
                    style={[
                      styles.stickerWrapper,
                      {
                        transform: [
                          { translateX: anim.translateX },
                          { translateY: anim.translateY },
                          { scale: anim.scale },
                        ],
                        zIndex: 9999,
                      },
                    ]}
                  >
                    <EmojiShimmer emoji={emoji} size={STICKER_SIZE} />
                  </Animated.View>
                </PanGestureHandler>
              );
            })}
          </View>

          {/* Profile picture in center */}
          <View style={styles.profileContainer}>
            <Image source={{ uri: profilePicture }} style={styles.profileImage} />
          </View>

          {/* Name below */}
          <Text style={[styles.name, { color: isLightColor(selectedBgColor) ? '#000' : '#fff' }]}>{name}</Text>
        </View>

        {/* Color picker buttons */}
        <View style={styles.colorPickerContainer}>
          {BACKGROUND_COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorButton,
                { backgroundColor: color },
                selectedBgColor === color && styles.colorButtonSelected,
              ]}
              onPress={() => setSelectedBgColor(color)}
            />
          ))}
        </View>

        {/* Action buttons (outside capture area) */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  container: {
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  stickersContainer: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerWrapper: {
    position: 'absolute',
  },
  profileContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  colorPickerContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: '#FFD700',
    borderWidth: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 15,
  },
  shareButton: {
    backgroundColor: '#4455aa',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#333',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});
