import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, StyleSheet, View } from 'react-native';
import { getImageSource, isImagePath } from '../assets/stickerImages';

const { width, height } = Dimensions.get('window');

interface ConfettiProps {
  active: boolean;
  duration?: number;
  count?: number;
  emoji?: string;
}

interface ConfettiPiece {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  color: string;
  size: number;
  finalX: number;
  isEmoji?: boolean;
  isImage?: boolean;
  imagePath?: string;
}

const COLORS = ['#FF5CB3', '#4455aa', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

const Confetti: React.FC<ConfettiProps> = ({ active, duration = 3000, count = 50, emoji }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (active) {
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = [];
      const isImage = emoji ? isImagePath(emoji) : false;
      const emojiCount = emoji ? Math.floor(count * 0.5) : 0; // 50% emoji/image if provided
      const confettiCount = count - emojiCount;
      
      for (let i = 0; i < confettiCount; i++) {
        const startX = Math.random() * width;
        const finalX = startX + (Math.random() - 0.5) * 200;
        newPieces.push({
          id: i,
          x: new Animated.Value(startX),
          y: new Animated.Value(-50),
          rotation: new Animated.Value(0),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: Math.random() * 10 + 5,
          finalX,
          isEmoji: false,
          isImage: false,
        });
      }
      
      // Add emoji/image pieces if emoji is provided
      for (let i = 0; i < emojiCount; i++) {
        const startX = Math.random() * width;
        const finalX = startX + (Math.random() - 0.5) * 200;
        newPieces.push({
          id: confettiCount + i,
          x: new Animated.Value(startX),
          y: new Animated.Value(-50),
          rotation: new Animated.Value(0),
          color: '',
          size: isImage ? 40 + Math.random() * 20 : 30 + Math.random() * 20,
          finalX,
          isEmoji: !isImage,
          isImage: isImage,
          imagePath: isImage ? emoji : undefined,
        });
      }
      setPieces(newPieces);

      // Start animation
      const animations = newPieces.map((piece, index) => {
        const delay = Math.random() * 500;
        return Animated.parallel([
          Animated.timing(piece.y, {
            toValue: height + 100,
            duration: duration + Math.random() * 1000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(piece.x, {
            toValue: piece.finalX,
            duration: duration + Math.random() * 1000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(piece.rotation, {
            toValue: Math.random() * 10,
            duration: duration + Math.random() * 1000,
            delay,
            useNativeDriver: true,
          }),
        ]);
      });

      animationRef.current = Animated.stagger(50, animations);
      animationRef.current.start(() => {
        setPieces([]);
      });
    } else {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      setPieces([]);
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [active, duration, count]);

  if (!active || pieces.length === 0) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 9999 }]} pointerEvents="none">
      {pieces.map((piece) => {
        if (piece.isImage && piece.imagePath) {
          const imageSource = getImageSource(piece.imagePath);
          return imageSource ? (
            <Animated.View
              key={piece.id}
              style={{
                position: 'absolute',
                width: piece.size,
                height: piece.size,
                transform: [
                  { translateX: piece.x },
                  { translateY: piece.y },
                  { rotate: piece.rotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })},
                ],
              }}
            >
              <Image 
                source={imageSource}
                style={{ 
                  width: piece.size, 
                  height: piece.size, 
                  borderRadius: piece.size / 4 
                }}
                resizeMode="cover"
              />
            </Animated.View>
          ) : null;
        } else if (piece.isEmoji) {
          return (
            <Animated.Text
              key={piece.id}
              style={{
                position: 'absolute',
                fontSize: piece.size,
                transform: [
                  { translateX: piece.x },
                  { translateY: piece.y },
                  { rotate: piece.rotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })},
                ],
              }}
            >
              {emoji}
            </Animated.Text>
          );
        } else {
          return (
            <Animated.View
              key={piece.id}
              style={{
                position: 'absolute',
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                borderRadius: piece.size / 2,
                transform: [
                  { translateX: piece.x },
                  { translateY: piece.y },
                  { rotate: piece.rotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })},
                ],
              }}
            />
          );
        }
      })}
    </View>
  );
};

export default Confetti;