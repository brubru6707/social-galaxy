import { useUser } from '@/contexts/UserContext';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import stickers from '../assets/stickers.json';
import Confetti from './Confetti';
import EventQuestionModal from './event-question-modal';
import HotTakeResults from './hot-take-results';

export type EventDetailsProps = {
  event: {
    id: string;
    title: string;
    description?: string;
    location: string;
    host?: string;
    date?: string;
    time?: string;
    category?: string;
    maxAttendees?: number;
    event_picture?: string;
    attendees?: string[];
  };
};



export default function EventDetails({ event }: EventDetailsProps) {
  const { currentUser, dailyQuestion, rsvpToEvent, endedEvents } = useUser();
  const isUserAttending = currentUser && currentUser.events_gone_to.includes(event.id);
  const [goingPressed, setGoingPressed] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [userAnswer, setUserAnswer] = useState<'left' | 'right' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Check if this event has been ended by admin
  const eventResult = endedEvents[event.id];
  const eventEnded = !!eventResult;

  // Show confetti when event results appear and user won
  useEffect(() => {
    if (eventEnded && eventResult && userAnswer) {
      const userWon = (userAnswer === 'left' && eventResult.leftPercent >= 50) || 
                       (userAnswer === 'right' && eventResult.rightPercent >= 50);
      if (userWon) {
        // Small delay to ensure rendering is complete
        const showTimer = setTimeout(() => {
          setShowConfetti(true);
        }, 100);
        const hideTimer = setTimeout(() => setShowConfetti(false), 4100);
        return () => {
          clearTimeout(showTimer);
          clearTimeout(hideTimer);
        };
      }
    }
  }, [eventEnded, eventResult?.leftPercent, eventResult?.rightPercent, userAnswer]);

  // Show modal only if user is not already attending and hasn't answered yet
  const handleGoingPress = () => {
    if (!isUserAttending && !goingPressed) {
      setShowQuestionModal(true);
      setGoingPressed(true);
    }
  };

  const handleAnswer = (answer: string) => {
    setShowQuestionModal(false);
    setAnswered(true);
    setUserAnswer(answer as 'left' | 'right');
    if (currentUser && !isUserAttending) {
      rsvpToEvent(event.id);
    }
  };

  // Determine winning emoji for confetti
  const getWinningEmoji = () => {
    if (!userAnswer || !eventResult) return undefined;
    
    const winningOption = userAnswer === 'left' ? dailyQuestion?.left : dailyQuestion?.right;
    return stickers[winningOption as keyof typeof stickers] || '🎉';
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, (isUserAttending || goingPressed) && styles.darkerBg]}>
      <Confetti active={showConfetti} emoji={getWinningEmoji()} />
      {event.event_picture && (
        <Image source={{ uri: event.event_picture }} style={styles.image} />
      )}
      <Text style={styles.title}>{event.title}</Text>
      
      {/* Show results after event ends */}
      {eventEnded && eventResult && (
        <View style={{ marginTop: 16, marginBottom: 16, width: '100%' }}>
          <HotTakeResults
            leftOption={dailyQuestion?.left || 'Option 1'}
            rightOption={dailyQuestion?.right || 'Option 2'}
            leftPercent={eventResult.leftPercent}
            rightPercent={eventResult.rightPercent}
            animate={true}
            showWrapper={true}
          />
        </View>
      )}
      
      <Text style={styles.location}>{event.location}</Text>
      {event.date && <Text style={styles.info}>Date: {event.date}</Text>}
      {event.time && <Text style={styles.info}>Time: {event.time}</Text>}
      {event.category && <Text style={styles.info}>Category: {event.category}</Text>}
      {event.maxAttendees && <Text style={styles.info}>Max Attendees: {event.maxAttendees}</Text>}
      {event.host && <Text style={styles.info}>Host: {event.host}</Text>}
      {event.description && <Text style={styles.description}>{event.description}</Text>}

      {/* RSVP Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.rsvpButton,
            { backgroundColor: '#4CAF50' },
            (isUserAttending || goingPressed) && styles.selectedButton
          ]}
          onPress={handleGoingPress}
          disabled={isUserAttending || goingPressed}
        >
          <Text style={styles.rsvpButtonText}>Going</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[
          styles.rsvpButton,
          { backgroundColor: '#FF9800' }
        ]}>
          <Text style={styles.rsvpButtonText}>Maybe</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[
          styles.rsvpButton,
          { backgroundColor: '#F44336' }
        ]}>
          <Text style={styles.rsvpButtonText}>Can't Go</Text>
        </TouchableOpacity>
      </View>

      {/* Event Question Modal (shared component) */}
      <EventQuestionModal
        visible={showQuestionModal}
        question={dailyQuestion?.question || 'Event Question'}
        leftOption={dailyQuestion?.left || 'Option 1'}
        rightOption={dailyQuestion?.right || 'Option 2'}
        onSelect={handleAnswer}
        onClose={() => setShowQuestionModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#000',
  },
  darkerBg: {
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 18,
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  location: {
    fontSize: 18,
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 24,
    width: '100%',
  },
  rsvpButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedButton: {
    width: 110,
    height: 110,
    borderRadius: 55,
    opacity: 0.9,
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  rsvpButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#222',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalQuestion: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 18,
  },
  modalOptionButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 8,
  },
  modalOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    marginTop: 8,
    padding: 8,
  },
  modalCloseText: {
    color: '#aaa',
    fontSize: 14,
  },
});
