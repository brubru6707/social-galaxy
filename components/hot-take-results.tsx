import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type HotTakeResultsProps = {
  leftOption: string;
  rightOption: string;
  leftPercent: number;
  rightPercent: number;
  animate?: boolean;
  showWrapper?: boolean;
};

export default function HotTakeResults({ 
  leftOption, 
  rightOption, 
  leftPercent, 
  rightPercent,
  animate = true,
  showWrapper = false
}: HotTakeResultsProps) {
  const leftAnim = useRef(new Animated.Value(0)).current;
  const rightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animate && leftPercent > 0) {
      Animated.parallel([
        Animated.timing(leftAnim, {
          toValue: leftPercent,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(rightAnim, {
          toValue: rightPercent,
          duration: 2000,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      leftAnim.setValue(leftPercent);
      rightAnim.setValue(rightPercent);
    }
  }, [leftPercent, rightPercent, animate, leftAnim, rightAnim]);

  return (
    <View style={showWrapper ? styles.wrapper : styles.progressContainer}>
      <View style={styles.progressContainer}>
        <View style={styles.percentageContainer}>
          <Text style={styles.percentageText}>{leftPercent}%</Text>
          <Text style={styles.percentageText}>{rightPercent}%</Text>
        </View>
        <View style={styles.barContainer}>
        <Animated.View 
          style={[
            styles.leftBar, 
            { 
              width: leftAnim.interpolate({ 
                inputRange: [0, 100], 
                outputRange: ['0%', '100%'] 
              }) 
            }
          ]}
        >
          <Text style={styles.barText}>{leftOption}</Text>
        </Animated.View>
        <Animated.View 
          style={[
            styles.rightBar, 
            { 
              width: rightAnim.interpolate({ 
                inputRange: [0, 100], 
                outputRange: ['0%', '100%'] 
              }) 
            }
          ]}
        >
          <Text style={styles.barText}>{rightOption}</Text>
        </Animated.View>
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  progressContainer: {
    alignItems: 'center',
    width: '100%',
  },
  percentageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  percentageText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  barContainer: {
    position: 'relative',
    height: 30,
    width: '100%',
    backgroundColor: '#333',
    borderRadius: 10,
  },
  leftBar: {
    position: 'absolute',
    left: 0,
    height: '100%',
    backgroundColor: '#FF5CB3',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightBar: {
    position: 'absolute',
    right: 0,
    height: '100%',
    backgroundColor: '#4455aa',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
