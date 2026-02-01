import EmojiShimmer from '@/components/Profile/Shimmer';
import * as Sharing from 'expo-sharing';
import React, { useMemo, useRef, useState } from 'react';
import { Animated, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LongPressGestureHandler, PanGestureHandler, State } from 'react-native-gesture-handler';
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
const PROFILE_ICON_RADIUS = 70;

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

  // Generate initial random positions
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

  const [deletedStickers, setDeletedStickers] = useState<Set<number>>(new Set());
  const [showDeleteFor, setShowDeleteFor] = useState<number | null>(null);
  
  // Z-Index Management
  const [stickerZIndices, setStickerZIndices] = useState<{ [key: number]: number }>({});
  const maxZIndexRef = useRef<number>(150);
  
  // Animated Values Refs
  const stickerAnimValues = useRef<{ [key: number]: { translateX: Animated.Value; translateY: Animated.Value; scale: Animated.Value } }>({});
  const gestureStartScales = useRef<{ [key: number]: number }>({});
  const gestureActive = useRef<{ [key: number]: boolean }>({});

  const handleDeleteSticker = (index: number) => {
    setDeletedStickers((prev) => new Set([...prev, index]));
    setShowDeleteFor(null);
  };

  const handleScaleSticker = (index: number, direction: 'up' | 'down') => {
    const anim = getStickerAnim(index);
    const currentScale = gestureStartScales.current[index] || 1;
    const scaleStep = 0.3;
    let newScale = direction === 'up' ? currentScale + scaleStep : currentScale - scaleStep;
    newScale = Math.max(0.5, Math.min(2.5, newScale));
    gestureStartScales.current[index] = newScale;
    
    Animated.spring(anim.scale, {
      toValue: newScale,
      useNativeDriver: false,
    }).start();
  };

  const getStickerAnim = (index: number) => {
    if (!stickerAnimValues.current[index]) {
      const initialPos = initialPositions[index] || { x: 0, y: 0 };
      stickerAnimValues.current[index] = {
        translateX: new Animated.Value(initialPos.x),
        translateY: new Animated.Value(initialPos.y),
        scale: new Animated.Value(1),
      };
      gestureStartScales.current[index] = 1;
      
      // Initialize Z-Index
      if (!(index in stickerZIndices)) {
        setStickerZIndices(prev => ({ ...prev, [index]: 150 + index }));
      }
    }
    return stickerAnimValues.current[index];
  };
  
  const bringToFront = (index: number) => {
    maxZIndexRef.current += 1;
    setStickerZIndices(prev => ({ ...prev, [index]: maxZIndexRef.current }));
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
          
          <TouchableOpacity 
            style={styles.cardTouchable} 
            activeOpacity={1}
            onPress={() => setShowDeleteFor(null)}
          />

          {/* Stickers Container */}
          <View style={styles.stickersContainer} pointerEvents="box-none">
            {stickers.map((emoji, index) => {
              if (deletedStickers.has(index)) return null;
              const anim = getStickerAnim(index);
              
              return (
                <LongPressGestureHandler
                  key={index}
                  minDurationMs={500}
                  onHandlerStateChange={(event) => {
                    if (event.nativeEvent.state === State.ACTIVE) {
                      setShowDeleteFor(index);
                      bringToFront(index);
                    }
                  }}
                >
                  {/* CRITICAL CHANGE: 
                      We wrap the PanGestureHandler in the Animated.View that has the Z-INDEX and TRANSFORM.
                      This ensures the stacking context is applied to the draggable unit.
                  */}
                  <Animated.View
                    style={[
                      styles.stickerWrapper,
                      {
                        transform: [
                          { translateX: anim.translateX },
                          { translateY: anim.translateY },
                          { scale: anim.scale },
                        ],
                        // Z-Index is applied here to the outer wrapper
                        zIndex: stickerZIndices[index] || 150 + index,
                        elevation: stickerZIndices[index] || 150 + index,
                      },
                    ]}
                  >
                    <PanGestureHandler
                      onGestureEvent={Animated.event(
                        [
                          {
                            nativeEvent: {
                              translationX: anim.translateX,
                              translationY: anim.translateY,
                            },
                          },
                        ],
                        { useNativeDriver: false }
                      )}
                      onHandlerStateChange={(event) => {
                        console.log(`[Sticker ${index}] State:`, event.nativeEvent.state);
                        console.log(`[Sticker ${index}] Translation:`, event.nativeEvent.translationX, event.nativeEvent.translationY);
                        console.log(`[Sticker ${index}] Current anim values:`, (anim.translateX as any)._value, (anim.translateY as any)._value);
                        console.log(`[Sticker ${index}] Current offset:`, (anim.translateX as any)._offset, (anim.translateY as any)._offset);
                        
                        if (event.nativeEvent.state === State.BEGAN) {
                          console.log(`[Sticker ${index}] BEGAN - gesture active?`, gestureActive.current[index]);
                          // Only process BEGAN once per gesture
                          if (!gestureActive.current[index]) {
                            console.log(`[Sticker ${index}] BEGAN - setting offset and resetting value`);
                            gestureActive.current[index] = true;
                            bringToFront(index);
                            // Extract current position to offset
                            anim.translateX.setOffset((anim.translateX as any)._value);
                            anim.translateY.setOffset((anim.translateY as any)._value);
                            // Reset value to 0 so gesture starts from 0
                            anim.translateX.setValue(0);
                            anim.translateY.setValue(0);
                          }
                        }
                        if (event.nativeEvent.state === State.END || event.nativeEvent.state === State.CANCELLED) {
                          console.log(`[Sticker ${index}] END/CANCELLED - flattening offset`);
                          gestureActive.current[index] = false;
                          // Merge offset + value into value
                          anim.translateX.flattenOffset();
                          anim.translateY.flattenOffset();
                          console.log(`[Sticker ${index}] After flatten - values:`, (anim.translateX as any)._value, (anim.translateY as any)._value);
                        }
                      }}
                    >
                      {/* The Inner View just holds the content, no positioning logic */}
                      <View>
                        <EmojiShimmer emoji={emoji} size={STICKER_SIZE} />
                        {showDeleteFor === index && (
                          <View style={styles.stickerControls}>
                            <TouchableOpacity
                              style={styles.scaleButton}
                              onPress={() => handleScaleSticker(index, 'down')}
                              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                            >
                              <Text style={styles.scaleButtonText}>−</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.deleteButton}
                              onPress={() => handleDeleteSticker(index)}
                              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                            >
                              <Text style={styles.deleteButtonText}>✕</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.scaleButton}
                              onPress={() => handleScaleSticker(index, 'up')}
                              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                            >
                              <Text style={styles.scaleButtonText}>+</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </PanGestureHandler>
                  </Animated.View>
                </LongPressGestureHandler>
              );
            })}
          </View>

          <View style={styles.profileContainer}>
            <Image source={{ uri: profilePicture }} style={styles.profileImage} />
          </View>

          <Text style={[styles.name, { color: isLightColor(selectedBgColor) ? '#000' : '#fff' }]}>{name}</Text>
        </View>

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
  cardTouchable: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickersContainer: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  stickerWrapper: {
    position: 'absolute', 
    // zIndex and transforms are applied dynamically inline
  },
  stickerControls: {
    position: 'absolute',
    top: -35,
    left: '50%',
    transform: [{ translateX: -45 }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scaleButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#4455aa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: -2,
  },
  profileContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    zIndex: 1,
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