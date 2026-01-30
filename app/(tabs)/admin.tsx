import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../contexts/UserContext';

export default function AdminScreen() {
  const { dailyQuestion, votes, endDay, newDay } = useUser();
  const [showPercentages, setShowPercentages] = useState(false);

  const handleNewDay = () => {
    if (dailyQuestion) {
      const total = votes.left + votes.right;
      const leftPercent = total > 0 ? Math.round((votes.left / total) * 100) : 0;
      const rightPercent = total > 0 ? Math.round((votes.right / total) * 100) : 0;
      Alert.alert(
        'Day Results',
        `${dailyQuestion.left}: ${leftPercent}%\n${dailyQuestion.right}: ${rightPercent}%`,
        [{ text: 'OK', onPress: () => { newDay(); setShowPercentages(false); } }]
      );
    } else {
      newDay();
    }
  };

  const handleEndDay = () => {
    endDay();
    // Results will be shown on the home page
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Admin Portal</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Day</Text>
        {dailyQuestion ? (
          <Text style={styles.question}>{dailyQuestion.question}</Text>
        ) : (
          <Text style={styles.noQuestion}>No active question</Text>
        )}
        <Text style={styles.votes}>Votes: {dailyQuestion?.left}: {votes.left} | {dailyQuestion?.right}: {votes.right}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleEndDay}>
          <Text style={styles.buttonText}>End of Day</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleNewDay}>
          <Text style={styles.buttonText}>New Day</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  question: {
    fontSize: 18,
    color: '#FFD700',
    marginBottom: 10,
  },
  noQuestion: {
    fontSize: 16,
    color: '#888',
  },
  votes: {
    fontSize: 16,
    color: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#FF5CB3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
