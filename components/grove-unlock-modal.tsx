import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Grove } from '@/assets/groves_data';

const { width, height } = Dimensions.get('window');

interface GroveUnlockModalProps {
  grove: Grove | null;
  onClose: () => void;
}

export default function GroveUnlockModal({ grove, onClose }: GroveUnlockModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (grove) {
      // Reset animations
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      fadeAnim.setValue(0);
      
      // Play celebration animation
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 }
        ),
      ]).start();
    }
  }, [grove]);
  
  if (!grove) return null;
  
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg'],
  });
  
  return (
    <Modal
      visible={grove !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { rotate: spin },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[grove.color, grove.color + '80', '#000']}
            style={styles.gradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          >
            {/* Sparkles */}
            <View style={styles.sparkles}>
              {[...Array(8)].map((_, i) => (
                <Animated.Text 
                  key={i} 
                  style={[
                    styles.sparkle,
                    {
                      top: `${10 + Math.random() * 30}%`,
                      left: `${10 + Math.random() * 80}%`,
                      opacity: fadeAnim,
                    },
                  ]}
                >
                  ✨
                </Animated.Text>
              ))}
            </View>
            
            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.unlockText}>GROVE UNLOCKED!</Text>
              
              <View style={styles.emojiContainer}>
                <Text style={styles.emoji}>{grove.emoji}</Text>
              </View>
              
              <Text style={styles.groveName}>{grove.name}</Text>
              
              <Text style={styles.description}>
                You've attended enough events to join this community!
              </Text>
              
              <View style={styles.perks}>
                <Text style={styles.perksTitle}>You can now:</Text>
                <Text style={styles.perk}>• See other member profiles</Text>
                <Text style={styles.perk}>• Access exclusive events</Text>
                <Text style={styles.perk}>• Customize your grove profile</Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: grove.color }]}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Enter the Grove</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.85,
    borderRadius: 32,
    overflow: 'hidden',
  },
  gradient: {
    padding: 32,
    alignItems: 'center',
    minHeight: 450,
  },
  sparkles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 24,
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  unlockText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 4,
    marginBottom: 24,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 64,
  },
  groveName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  perks: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  perksTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  perk: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
