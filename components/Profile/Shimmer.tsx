import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

type ShimmerProps = {
  emoji: string;
  size?: number;
  style?: any;
};

export default function ShimmerNoMask({ emoji, size = 80, style }: ShimmerProps) {
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear, // Smooth continuous movement
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);

  // Move the beam from far left to far right
  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-size * 1.5, size * 1.5], 
  });

  return (
    <View style={[styles.container, style, { width: size, height: size }]}>
      {/* 1. The Emoji */}
      <Text style={[styles.emoji, { fontSize: size, lineHeight: size }]}>
        {emoji}
      </Text>

      {/* 2. The "Spotlight" Beam Overlay */}
      {/* We use overflow: 'hidden' on the container to keep the beam inside the box */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { 
            transform: [{ translateX }],
            opacity: 0.5 // Keep it subtle so it doesn't block the emoji
          },
        ]}
      >
        <LinearGradient
          // A softer, wider white beam
          colors={['transparent', 'white', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }} // Horizontal swipe
          style={{ flex: 1, width: '50%' }} // Beam is 50% width of container
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden', // Essential: cuts off the beam when it leaves the box
    justifyContent: 'center',
    alignItems: 'center',
    // Optional: rounds the spotlight edges if you want a circular "coin" look
    // borderRadius: 999, 
  },
  emoji: {
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});