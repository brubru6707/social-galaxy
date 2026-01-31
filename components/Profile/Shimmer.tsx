import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

type ShimmerProps = {
  emoji: string;
  size?: number;
};

export default function EmojiShimmer({ emoji, size = 80 }: ShimmerProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  console.log('[DEBUG] Rendering EmojiShimmer for', emoji, 'with size', size);
  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1200, // Faster loop to verify it works
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-size, size], // Moves beam from left to right
  });

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      
      {/* LAYER 1: The Base Emoji (Always visible) */}
      <Text style={{ fontSize: size }}>{emoji}</Text>

      {/* LAYER 2: The Shimmer Overlay */}
      <MaskedView
        style={StyleSheet.absoluteFill}
        maskElement={
          <View style={styles.maskContainer}>
            <Text style={{ fontSize: size }}>{emoji}</Text>
          </View>
        }
      >
        {/* The Moving Beam */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { transform: [{ translateX }] }
          ]}
        >
          <LinearGradient
            colors={[
              'transparent', 
              'rgba(255, 255, 255, 0.8)', // High visibility white
              'transparent'
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      </MaskedView>
    </View>
  );
}

const styles = StyleSheet.create({
  maskContainer: {
    flex: 1,
    backgroundColor: 'transparent', // Crucial for the mask to work
    justifyContent: 'center',
    alignItems: 'center',
  },
});