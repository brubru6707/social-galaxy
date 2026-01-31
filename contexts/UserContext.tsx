import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the User type based on your mock_data.json
export interface User {
  id: string;
  name: string;
  bio: string;
  dob: string;
  profile_picture: string;
  events_gone_to: string[];
  hot_take_answers: any[]; // You can type this more specifically if needed
  // Add other fields as they appear in your data
}

interface UserContextType {
  currentUser: User | null;
  allUsers: User[];
  setCurrentUser: (user: User | null) => void;
  dailyQuestion: { question: string; left: string; right: string } | null;
  votes: { left: number; right: number };
  setDailyQuestion: (q: { question: string; left: string; right: string } | null) => void;
  addVote: (side: 'left' | 'right') => void;
  endDay: () => void;
  newDay: () => void;
  showResults: boolean;
  setShowResults: (show: boolean) => void;
  rsvpToEvent: (eventId: string) => void;
  endedEvents: Record<string, { leftPercent: number; rightPercent: number }>;
  endEvent: (eventId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};


export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [dailyQuestion, setDailyQuestion] = useState<{ question: string; left: string; right: string } | null>({
    question: 'Coffee vs Tea',
    left: 'Coffee',
    right: 'Tea'
  });
  const [votes, setVotes] = useState({ left: 0, right: 0 });
  const [showResults, setShowResults] = useState(false);
  const [endedEvents, setEndedEvents] = useState<Record<string, { leftPercent: number; rightPercent: number }>>({});
  const [userVote, setUserVote] = useState<'left' | 'right' | null>(null);

  // Setup notifications
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    })();
  }, []);

  const addVote = (side: 'left' | 'right') => {
    setVotes(prev => ({ ...prev, [side]: prev[side] + 1 }));
    setUserVote(side);
  };

  const endEvent = (eventId: string) => {
    // Generate mock percentages for now
    const left = Math.floor(Math.random() * 100);
    const right = 100 - left;
    setEndedEvents(prev => ({
      ...prev,
      [eventId]: { leftPercent: left, rightPercent: right }
    }));
  };

  const endDay = async () => {
    setShowResults(true);
    
    // Send notification to user about results
    if (userVote && dailyQuestion) {
      const total = votes.left + votes.right;
      const leftPercent = total > 0 ? Math.round((votes.left / total) * 100) : 0;
      const rightPercent = 100 - leftPercent;
      
      const userWon = (userVote === 'left' && leftPercent >= 50) || (userVote === 'right' && rightPercent >= 50);
      const winningOption = leftPercent >= 50 ? dailyQuestion.left : dailyQuestion.right;
      
      let title, body;
      if (userWon) {
        const messages = [
          `OMG YOU WON!! 🎉`,
          `YOOO YOU CALLED IT!! 💯`,
          `NO WAY YOU WON!! 🔥`,
          `BRO YOU CRUSHED IT!! ⚡`,
        ];
        title = messages[Math.floor(Math.random() * messages.length)];
        body = `${winningOption} gang came through with ${userVote === 'left' ? leftPercent : rightPercent}%!! 😤`;
      } else {
        const messages = [
          `rip you took the L 💀`,
          `yeah... you lost this one chief 😬`,
          `oof that didn't age well 💩`,
          `L + ratio my guy 🤡`,
        ];
        title = messages[Math.floor(Math.random() * messages.length)];
        body = `${winningOption} won with ${leftPercent >= 50 ? leftPercent : rightPercent}% lmaoo`;
      }
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: {type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2}, // delay notification by 10 seconds
      });
    }
  };

  const newDay = () => {
    setShowResults(false);
    // Show percentages (handled in admin), then pick new question
    // For now, cycle through some questions
    const questions = [
      { question: 'Coffee vs Tea', left: 'Coffee', right: 'Tea' },
      { question: 'Pizza vs Burgers', left: 'Pizza', right: 'Burgers' },
      { question: 'Vim vs Emacs', left: 'Vim', right: 'Emacs' },
    ];
    const currentIndex = dailyQuestion ? questions.findIndex(q => q.question === dailyQuestion.question) : -1;
    const nextIndex = (currentIndex + 1) % questions.length;
    setDailyQuestion(questions[nextIndex]);
    setVotes({ left: 0, right: 0 }); // Reset votes for new day
  };

  // RSVP persistence logic
  const rsvpToEvent = (eventId: string) => {
    setAllUsers(prevUsers => {
      return prevUsers.map(user => {
        if (user.id === currentUser?.id) {
          // Only add if not already attending
          if (!user.events_gone_to.includes(eventId)) {
            return {
              ...user,
              events_gone_to: [...user.events_gone_to, eventId],
            };
          }
        }
        return user;
      });
    });
    // Also update currentUser
    setCurrentUser(prevUser => {
      if (!prevUser) return prevUser;
      if (!prevUser.events_gone_to.includes(eventId)) {
        return {
          ...prevUser,
          events_gone_to: [...prevUser.events_gone_to, eventId],
        };
      }
      return prevUser;
    });
  };

  useEffect(() => {
    // Load mock data
    const loadMockData = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll import the JSON directly
        const mockData = require('../assets/mock_data.json');
        const users: User[] = mockData.users;

        setAllUsers(users);

        // Set the first user as current user
        if (users.length > 0) {
          setCurrentUser(users[0]);
        }
      } catch (error) {
        console.error('Failed to load mock data:', error);
      }
    };

    loadMockData();
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, allUsers, setCurrentUser, dailyQuestion, votes, setDailyQuestion, addVote, endDay, newDay, showResults, setShowResults, rsvpToEvent, endedEvents, endEvent }}>
      {children}
    </UserContext.Provider>
  );
};