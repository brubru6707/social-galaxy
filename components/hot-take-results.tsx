import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// --- Configuration ---
const { width, height } = Dimensions.get('window');
const PARTY_EMOJIS = ['🍷', '🍺', '🍸', '🎵', '🎸', '🪩', '🥂'];
const SAD_EMOJIS = ['😢', '😭', '😔', '😞', '💔', '😿'];
const NUM_FALLING_EMOJIS = 15;

// --- Helper Component: Single Falling Emoji ---
const FallingEmoji = ({ delay, userWon }: { delay: number; userWon: boolean }) => {
  // Random start X position
  const startX = Math.random() * (width - 40); 
  const animVal = useRef(new Animated.Value(-50)).current;
  const emojiList = userWon ? PARTY_EMOJIS : SAD_EMOJIS;
  const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];

  useEffect(() => {
    // Create a looping falling animation
    const runAnimation = () => {
      animVal.setValue(-50); // Reset to top
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(animVal, {
          toValue: height + 50, // Fall past bottom
          duration: 3000 + Math.random() * 2000, // Random speed
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ]).start((result) => {
        if (result.finished) {
          runAnimation(); // Loop
        }
      });
    };

    runAnimation();
  }, [animVal, delay]);

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: startX,
        top: 0,
        fontSize: 30,
        transform: [{ translateY: animVal }],
        zIndex: 0, // Behind the main content
      }}
    >
      {emoji}
    </Animated.Text>
  );
};

// --- Main Component ---

type HotTakeResultsProps = {
  leftOption: string; // e.g., "The Bar"
  rightOption: string; // e.g., "Dance Floor"
  leftPercent: number;
  rightPercent: number;
  animate?: boolean;
  showWrapper?: boolean;
  onClose?: () => void;
  userWon?: boolean;
};

export default function HotTakeResults({ 
  leftOption = "THE BAR", 
  rightOption = "DANCE FLOOR", 
  leftPercent, 
  rightPercent,
  animate = true,
  onClose,
  userWon = true,
}: HotTakeResultsProps) {
  
  // Determine winner for styling highlights
  const isLeftWinner = leftPercent >= rightPercent;

  // Animation for the numbers (counting up)
  const [displayLeft, setDisplayLeft] = useState(0);
  const [displayRight, setDisplayRight] = useState(0);
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animate) {
      Animated.timing(animValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false, // False because we are listening to value changes
        easing: Easing.out(Easing.exp),
      }).start();

      // Listener to update state numbers
      const listener = animValue.addListener(({ value }) => {
        setDisplayLeft(Math.floor(value * leftPercent));
        setDisplayRight(Math.floor(value * rightPercent));
      });

      return () => animValue.removeListener(listener);
    } else {
      setDisplayLeft(leftPercent);
      setDisplayRight(rightPercent);
    }
  }, [leftPercent, rightPercent, animate]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Falling Emojis Background Layer */}
      <View style={styles.emojiLayer} pointerEvents="none">
        {Array.from({ length: NUM_FALLING_EMOJIS }).map((_, i) => (
          <FallingEmoji key={i} delay={i * 800} userWon={userWon} />
        ))}
      </View>

      {/* 2. Header "Pulse Results" */}
      <View style={styles.header}>
        <View style={styles.pillContainer}>
          <Text style={styles.pillText}>{userWon ? 'YOU ARE IN THE MAJORITY!' : 'YOU ARE IN THE MINORITY!'}</Text>
        </View>
      </View>

      {/* 3. Main Split Content */}
      <View style={styles.splitWrapper}>
        
        {/* LEFT SIDE (Cyan) */}
        <View style={[
            styles.sideContainer, 
            styles.leftBorder, 
            { opacity: isLeftWinner ? 1 : 0.5, flex: isLeftWinner ? 1.5 : 0.5 } // Dim loser slightly
        ]}>
          {/* Neon "O" */}
          <Text style={[styles.bigIcon, styles.cyanText, styles.cyanGlow]}>O</Text>
          
          {/* Percentage */}
          <Text style={[styles.percentText, styles.cyanText, styles.cyanGlow]}>
            {displayLeft}%
          </Text>
          
          {/* Label */}
          <Text style={styles.labelText}>
            {leftOption.toUpperCase()}
          </Text>
        </View>

        {/* Vertical Divider Line */}
        <View style={styles.divider} />

        {/* RIGHT SIDE (Purple) */}
        <View style={[
            styles.sideContainer, 
            styles.rightBorder,
            { opacity: !isLeftWinner ? 1 : 0.6, flex: !isLeftWinner ? 1.5 : 0.5 } // Dim loser slightly
        ]}>
          {/* Neon "X" */}
          <Text style={[styles.bigIcon, styles.purpleText, styles.purpleGlow]}>X</Text>
          
          {/* Percentage */}
          <Text style={[styles.percentText, styles.purpleText, styles.purpleGlow]}>
            {displayRight}%
          </Text>
          
          {/* Label */}
          <Text style={styles.labelText}>
            {rightOption.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* 4. Bottom Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>CLAIM YOUR STAMP →</Text>
        </TouchableOpacity>
        <Text style={styles.timerText}>NEXT PULSE IN 04:59</Text>
      </View>

    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#120521', // Dark deep purple/black background
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  emojiLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  header: {
    zIndex: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  pillContainer: {
    backgroundColor: '#2a2a4a',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  pillText: {
    color: '#00f2ff', // Cyan text
    fontWeight: 'bold',
    letterSpacing: 1,
    fontSize: 12,
  },
  splitWrapper: {
    flexDirection: 'row',
    width: '100%',
    height: '50%', // Occupy middle half of screen
    marginTop: 20,
    zIndex: 1, // Above emojis
  },
  sideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  leftBorder: {
    borderWidth: 2,
    borderColor: '#00f2ff', // Cyan Border box for Left side
    borderRadius: 4,
    backgroundColor: 'rgba(0, 242, 255, 0.05)', // Very faint background tint
  },
  rightBorder: {
    borderWidth: 2,
    borderColor: '#bd00ff', // Purple Border box for Right side
    borderRadius: 4,
    backgroundColor: 'rgba(189, 0, 255, 0.05)', // Very faint background tint
  },
  divider: {
    width: 1,
    backgroundColor: '#444',
    height: '100%',
  },
  // Typography Styles
  bigIcon: {
    fontSize: 100,
    fontWeight: '900',
    marginBottom: 10,
  },
  percentText: {
    fontSize: 60,
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  labelText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
    lineHeight: 24,
  },
  // Colors & Glows
  cyanText: {
    color: '#00f2ff',
  },
  cyanGlow: {
    textShadowColor: '#00f2ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  purpleText: {
    color: '#bd00ff',
  },
  purpleGlow: {
    textShadowColor: '#bd00ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  // Footer
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#bd00ff', // Bright purple button
    width: '100%',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#bd00ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  timerText: {
    color: '#666',
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  }
});