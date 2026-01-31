import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { height } = Dimensions.get('window');

interface AnimatedLiquidGradientProps {
  height?: number;
  opacity?: number;
}

export default function AnimatedLiquidGradient({
  height: gradientHeight = height * 0.15,
  opacity = 1
}: AnimatedLiquidGradientProps) {
  // Animated values for liquid gradient effect
  const gradientAnim1 = useRef(new Animated.Value(0)).current;
  const gradientAnim2 = useRef(new Animated.Value(0)).current;
  const gradientAnim3 = useRef(new Animated.Value(0)).current;

  // Animate gradient to create liquid/water movement effect
  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(gradientAnim1, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(gradientAnim1, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(gradientAnim2, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(gradientAnim2, {
            toValue: 0,
            duration: 5000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(gradientAnim3, {
            toValue: 1,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(gradientAnim3, {
            toValue: 0,
            duration: 6000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <View style={[styles.gradientContainer, { height: gradientHeight, opacity }]}>
      <Animated.View
        style={[
          styles.gradientLayer,
          {
            opacity: gradientAnim1.interpolate({
              inputRange: [0, 1],
              outputRange: [0.2, 0.4],
            }),
            transform: [
              {
                translateX: gradientAnim1.interpolate({
                  inputRange: [0, 0.25, 0.5, 0.75, 1],
                  outputRange: [-15, 10, -5, 15, -20],
                }),
              },
              {
                translateY: gradientAnim1.interpolate({
                  inputRange: [0, 0.25, 0.5, 0.75, 1],
                  outputRange: [-8, 12, -3, 8, -10],
                }),
              },
              {
                scale: gradientAnim1.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.95, 1.05, 0.98],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['#6B46C1', '#8B5CF6', '#EC4899', '#F472B6', '#3B82F6', '#60A5FA', 'rgba(147, 197, 253, 0.4)', 'rgba(196, 181, 253, 0.15)', 'transparent']}
          locations={[0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.85, 0.95, 1]}
          style={styles.gradient}
          start={{ x: 0.2, y: 0.1 }}
          end={{ x: 0.8, y: 0.9 }}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.gradientLayer,
          {
            opacity: gradientAnim2.interpolate({
              inputRange: [0, 1],
              outputRange: [0.15, 0.35],
            }),
            transform: [
              {
                translateX: gradientAnim2.interpolate({
                  inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                  outputRange: [18, -8, 22, -12, 16, -18],
                }),
              },
              {
                translateY: gradientAnim2.interpolate({
                  inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                  outputRange: [6, -14, 18, -6, 12, -8],
                }),
              },
              {
                scale: gradientAnim2.interpolate({
                  inputRange: [0, 0.3, 0.7, 1],
                  outputRange: [1.02, 0.96, 1.08, 0.99],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['#9333EA', '#A855F7', '#F472B6', '#FB7185', '#60A5FA', '#93C5FD', 'rgba(165, 180, 252, 0.5)', 'rgba(196, 181, 253, 0.2)', 'transparent']}
          locations={[0, 0.12, 0.28, 0.42, 0.58, 0.72, 0.82, 0.92, 1]}
          style={styles.gradient}
          start={{ x: 0.8, y: 0.2 }}
          end={{ x: 0.1, y: 0.8 }}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.gradientLayer,
          {
            opacity: gradientAnim3.interpolate({
              inputRange: [0, 1],
              outputRange: [0.1, 0.25],
            }),
            transform: [
              {
                translateX: gradientAnim3.interpolate({
                  inputRange: [0, 0.33, 0.66, 1],
                  outputRange: [-12, 8, -18, 6],
                }),
              },
              {
                translateY: gradientAnim3.interpolate({
                  inputRange: [0, 0.33, 0.66, 1],
                  outputRange: [12, -16, 20, -4],
                }),
              },
              {
                scale: gradientAnim3.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.97, 1.06, 1.01],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['#A855F7', '#C084FC', '#DB2777', '#EC4899', '#2563EB', '#3B82F6', 'rgba(147, 197, 253, 0.3)', 'rgba(165, 180, 252, 0.1)', 'transparent']}
          locations={[0, 0.18, 0.32, 0.48, 0.64, 0.78, 0.88, 0.96, 1]}
          style={styles.gradient}
          start={{ x: 0.4, y: 0 }}
          end={{ x: 0.6, y: 1 }}
        />
      </Animated.View>
      {/* Fade out overlay */}
      <LinearGradient
        colors={['transparent', 'transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
        locations={[0, 0.3, 0.6, 1]}
        style={styles.fadeOverlay}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    overflow: 'hidden',
  },
  gradientLayer: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fadeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});