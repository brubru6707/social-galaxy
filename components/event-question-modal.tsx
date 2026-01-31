import { Ionicons } from '@expo/vector-icons'; // Standard in Expo
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export type EventQuestionModalProps = {
  visible: boolean;
  onSelect: (answer: 'left' | 'right') => void;
  onClose?: () => void;
  // Passing specific strings to match the image context, 
  // but keeping them props for reusability
  question?: string; 
  leftOption?: string; 
  rightOption?: string;
};

export default function EventQuestionModal({
  visible,
  // Defaulting strictly to the image text for the demo
  leftOption = "THE\nBAR",
  rightOption = "DANCE\nFLOOR",
  onSelect,
  onClose,
}: EventQuestionModalProps) {
  
  // Helper to split the question string to match the "BAR OR DANCE FLOOR" stacked look
  // In a real app, you might pass these as separate props
  const renderQuestionHeader = () => {
    return (
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerTitleItalic}>{leftOption}</Text>
        <Text style={styles.headerOr}>OR</Text>
        <Text style={styles.headerTitleItalic}>{rightOption}?</Text>
        <Text style={styles.subHeader}>CHOOSE YOUR VIBE</Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Dark Background Gradient */}
        <LinearGradient
          // Deep purple to almost black
          colors={["#1A0526", "#090212", "#000"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />

        <SafeAreaView style={styles.safeArea}>
          
          {/* Top Navigation Bar */}
          <View style={styles.topNav}>
             {/* Close Button */}
            <TouchableOpacity style={styles.circleButton} onPress={onClose}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>

            {/* Live Pulse Header */}
            <View style={styles.liveStatusContainer}>
              <Text style={styles.liveTitle}>Live Pulse</Text>
              <View style={styles.pulseRow}>
                <View style={styles.pulseDot} />
                <Text style={styles.pulseCount}>1,248 PULSING</Text>
              </View>
            </View>

            {/* Share Button */}
            <TouchableOpacity style={styles.circleButton}>
               <Ionicons name="share-social" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Main Content Area */}
          <View style={styles.contentContainer}>
            
            {/* The Question Text */}
            {renderQuestionHeader()}

            {/* The Split Selection Box */}
            <View style={styles.selectionContainer}>
              
              {/* Left Option (Cyan) */}
              <TouchableOpacity 
                style={[styles.optionBox, styles.leftBox]} 
                onPress={() => onSelect('left')}
                activeOpacity={0.8}
              >
                <View style={styles.glowContainerCyan}>
                  <Text style={styles.bigSymbolCyan}>O</Text>
                </View>
                <Text style={styles.optionLabel}>{leftOption}</Text>
              </TouchableOpacity>

              {/* Vertical Divider */}
              <View style={styles.divider} />

              {/* Right Option (Magenta) */}
              <TouchableOpacity 
                style={[styles.optionBox, styles.rightBox]} 
                onPress={() => onSelect('right')}
                activeOpacity={0.8}
              >
                <View style={styles.glowContainerMagenta}>
                  <Text style={styles.bigSymbolMagenta}>X</Text>
                </View>
                <Text style={styles.optionLabel}>{rightOption}</Text>
              </TouchableOpacity>

            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const CYAN_COLOR = '#00F0FF';
const MAGENTA_COLOR = '#E000FF';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  // --- Top Nav ---
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 10,
    marginBottom: 20,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveStatusContainer: {
    alignItems: 'center',
  },
  liveTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  pulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF3B30', // Red dot
    marginRight: 6,
  },
  pulseCount: {
    color: '#D1D1D6',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // --- Header Text ---
  contentContainer: {
    flex: 1,
    justifyContent: 'center', // Centers vertically
    paddingBottom: 40,
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitleItalic: {
    color: '#fff',
    fontSize: 36,
    fontStyle: 'italic',
    fontWeight: '900', // Extra bold
    textAlign: 'center',
    letterSpacing: -1,
  },
  headerOr: {
    color: '#C026D3', // Purple/Pink ish
    fontSize: 16,
    fontWeight: '800',
    marginVertical: 4,
  },
  subHeader: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 4, // Wide spacing
    marginTop: 20,
    textTransform: 'uppercase',
  },

  // --- Selection Boxes ---
  selectionContainer: {
    flexDirection: 'row',
    height: 320, // Fixed height for the square-ish look
    marginHorizontal: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optionBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)', // Very subtle fill
  },
  leftBox: {
    borderLeftWidth: 1,
    borderLeftColor: CYAN_COLOR,
    // Add a subtle inner shadow feel via border if needed, or keeping it simple
  },
  rightBox: {
    borderRightWidth: 1,
    borderRightColor: MAGENTA_COLOR,
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  
  // --- Symbols (O and X) ---
  glowContainerCyan: {
    marginBottom: 20,
    shadowColor: CYAN_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10, // Android glow
  },
  glowContainerMagenta: {
    marginBottom: 20,
    shadowColor: MAGENTA_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  bigSymbolCyan: {
    color: CYAN_COLOR,
    fontSize: 100,
    fontWeight: 'bold',
    // Text Shadow for iOS Glow
    textShadowColor: CYAN_COLOR,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 1,
  },
  bigSymbolMagenta: {
    color: MAGENTA_COLOR,
    fontSize: 100,
    fontWeight: 'bold',
    // Text Shadow for iOS Glow
    textShadowColor: MAGENTA_COLOR,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 1,
  },
  optionLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 3,
    lineHeight: 24,
    textTransform: 'uppercase',
  },
});