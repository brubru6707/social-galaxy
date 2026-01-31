import React from 'react';
import { StyleSheet, View } from 'react-native';
import EmojiShimmer from './Shimmer';

export default function StickerEmoji({ emoji }: { emoji: string }) {
  return (
    <View style={styles.emojiWrap}>
      <EmojiShimmer emoji={emoji} size={30} />
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
});
