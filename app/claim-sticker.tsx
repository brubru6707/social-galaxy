import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import stickers from '../assets/stickers.json';
import AnimatedLiquidGradient from '../components/AnimatedLiquidGradient';
import EmojiShimmer from '../components/Profile/Shimmer';
import { useUser } from '../contexts/UserContext';
import { getDisplayName } from '../utils/displayNames';

export default function ClaimStampScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userChoice, leftOption, rightOption } = params;
  const { addHotTakeAnswer, dailyQuestion } = useUser();

  // Get the sticker emoji based on user's choice
  const chosenOption = userChoice === 'left' ? leftOption : rightOption;
  const stickerEmoji = stickers[chosenOption as keyof typeof stickers] || '🎉';
  const displayName = getDisplayName(chosenOption as string);

  // Save the hot take answer when the component mounts
  useEffect(() => {
    if (dailyQuestion && chosenOption) {
      const questionText = `${leftOption} vs ${rightOption}`;
      addHotTakeAnswer(questionText, chosenOption as string);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedLiquidGradient />
      <View style={styles.content}>
        <Text style={styles.title}>STAMP CLAIMED! 🎉</Text>

        <View style={styles.stickerContainer}>
          <EmojiShimmer emoji={stickerEmoji} size={80} />
          <Text style={styles.stickerLabel}>{displayName}</Text>
        </View>

        <Text style={styles.message}>
          You've earned the <Text style={styles.highlight}>{displayName}</Text> stamp!
        </Text>

        <Text style={styles.subMessage}>
          This stamp has been added to your profile collection.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Text style={styles.buttonText}>VIEW MY STAMPS →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>BACK TO RESULTS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 40,
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  stickerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 30,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  stickerEmoji: {
    fontSize: 80,
    marginBottom: 10,
  },
  stickerLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
  },
  message: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 28,
  },
  highlight: {
    color: '#FF5CB3',
    fontWeight: 'bold',
  },
  subMessage: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#FF5CB3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
});