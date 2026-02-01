import React from 'react';
import { Animated } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import StickerEmoji from './StickerEmoji';

export default function DraggableStickerEmoji({
  index,
  emojiAnim,
  getAnswerEmoji,
  gestureStartPositions,
  setEmojiPositions,
  zIndex,
  onBringToFront,
}: {
  index: number;
  emojiAnim: any;
  getAnswerEmoji: (answer: string) => string;
  gestureStartPositions: React.MutableRefObject<{ [key: number]: { x: number; y: number } }>;
  setEmojiPositions: React.Dispatch<React.SetStateAction<{ [key: number]: { x: number; y: number } }>>;
  zIndex: number;
  onBringToFront: (index: number) => void;
}) {
  return (
    <PanGestureHandler
      minDurationMs={500}
      activeOffsetX={[-10, 10]}
      activeOffsetY={[-10, 10]}
      simultaneousHandlers={[]}
      onGestureEvent={Animated.event(
        [],
        {
          useNativeDriver: false,
          listener: (event) => {
            const startPos = gestureStartPositions.current[index] || { x: 0, y: 0 };
            emojiAnim.translateX.setValue(startPos.x + event.nativeEvent.translationX);
            emojiAnim.translateY.setValue(startPos.y + event.nativeEvent.translationY);
            setEmojiPositions((prev) => ({
              ...prev,
              [index]: {
                x: startPos.x + event.nativeEvent.translationX,
                y: startPos.y + event.nativeEvent.translationY,
              },
            }));
          },
        }
      )}
      onHandlerStateChange={(event) => {
        if (event.nativeEvent.state === State.BEGAN) {
          // Bring this sticker to the front
          onBringToFront(index);
          
          gestureStartPositions.current[index] = {
            x: emojiAnim.translateX._value,
            y: emojiAnim.translateY._value,
          };
          Animated.spring(emojiAnim.scale, {
            toValue: 1.5,
            useNativeDriver: false,
          }).start();
        } else if (
          event.nativeEvent.state === State.END ||
          event.nativeEvent.state === State.CANCELLED ||
          event.nativeEvent.state === State.FAILED
        ) {
          Animated.spring(emojiAnim.scale, {
            toValue: 1,
            useNativeDriver: false,
          }).start();
        }
      }}
    >
      <Animated.View
        style={[
          {
            transform: [
              { translateX: emojiAnim.translateX },
              { translateY: emojiAnim.translateY },
              { scale: emojiAnim.scale },
            ],
            zIndex: zIndex,
            elevation: zIndex,
          },
        ]}
      >
        <StickerEmoji emoji={getAnswerEmoji(index)} />
      </Animated.View>
    </PanGestureHandler>
  );
}
