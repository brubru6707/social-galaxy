import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Shimmer from './Shimmer';

export default function StickerEmoji({ emoji }: { emoji: string }) {
  return (
    <View style={styles.emojiWrap}>
      <Text style={styles.stickerEmoji}>{emoji}</Text>
      <Shimmer style={styles.shimmerOverlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  emojiWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36,
  },
  stickerEmoji: {
    fontSize: 30,
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    shadowColor: '#474643ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 1,
  }
});
