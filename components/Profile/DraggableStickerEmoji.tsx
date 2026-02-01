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
  setEmojiPositions: (index: number, position: { x: number; y: number; scale?: number }) => void;
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
            const newX = startPos.x + event.nativeEvent.translationX;
            const newY = startPos.y + event.nativeEvent.translationY;
            emojiAnim.translateX.setValue(newX);
            emojiAnim.translateY.setValue(newY);
            
            const currentScale = emojiAnim.scale._value || 1;
            console.log(`[PROFILE DraggableSticker ${index}] Dragging - x: ${newX.toFixed(2)}, y: ${newY.toFixed(2)}, scale: ${currentScale}`);
            
            setEmojiPositions(index, {
              x: newX,
              y: newY,
              scale: currentScale,
            });
          },
        }
      )}
      onHandlerStateChange={(event) => {
        console.log(`[PROFILE DraggableSticker ${index}] State changed:`, event.nativeEvent.state);
        
        if (event.nativeEvent.state === State.BEGAN) {
          console.log(`[PROFILE DraggableSticker ${index}] BEGAN - Bringing to front`);
          // Bring this sticker to the front
          onBringToFront(index);
          
          gestureStartPositions.current[index] = {
            x: emojiAnim.translateX._value,
            y: emojiAnim.translateY._value,
          };
          console.log(`[PROFILE DraggableSticker ${index}] Start position:`, gestureStartPositions.current[index]);
          
          Animated.spring(emojiAnim.scale, {
            toValue: 1.5,
            useNativeDriver: false,
          }).start();
        } else if (
          event.nativeEvent.state === State.END ||
          event.nativeEvent.state === State.CANCELLED ||
          event.nativeEvent.state === State.FAILED
        ) {
          console.log(`[PROFILE DraggableSticker ${index}] END - Saving final position`);
          const finalX = emojiAnim.translateX._value;
          const finalY = emojiAnim.translateY._value;
          const finalScale = 1; // Reset to 1 after drag
          
          console.log(`[PROFILE DraggableSticker ${index}] Final position - x: ${finalX}, y: ${finalY}, scale: ${finalScale}`);
          
          // Save final position with scale
          setEmojiPositions(index, {
            x: finalX,
            y: finalY,
            scale: finalScale,
          });
          
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
