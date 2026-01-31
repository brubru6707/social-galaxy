import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated } from 'react-native';

export default function Shimmer({ style }: { style?: any }) {
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.delay(800),
      ])
    ).start();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 60],
  });

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0, 0.6, 0.6, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[{
        position: 'absolute',
        top: -5,
        left: -5,
        width: 46,
        height: 46,
        transform: [{ translateX }, { rotate: '45deg' }],
        opacity,
      }, style]}
    >
      <LinearGradient
        colors={["transparent", "rgba(255, 255, 255, 0.9)", "rgba(255, 255, 255, 0.9)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1, width: '100%', height: '100%' }}
      />
    </Animated.View>
  );
}
