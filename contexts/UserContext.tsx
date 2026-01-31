import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Define the User type based on your mock_data.json
export interface User {
  id: string;
  name: string;
  bio: string;
  dob: string;
  profile_picture: string;
  events_gone_to: any[];
  hot_take_answers: any[];
  preferences: {
    lifestyle: number;
    tech: number;
    entertainment: number;
    food: number;
  };
  mutuals?: any[]; // Add mutuals property for compatibility with mock_data.json
  // Add other fields as they appear in your data
}

interface UserContextType {
  currentUser: User | null;
  allUsers: User[];
  setCurrentUser: (user: User | null) => void;
  dailyQuestion: { question: string; left: string; right: string } | null;
  votes: { left: number; right: number };
  finalResults: { leftPercent: number; rightPercent: number } | null;
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
  const [dailyQuestion, setDailyQuestion] = useState<{ question: string; left: string; right: string } | null>(null);
  const [votes, setVotes] = useState({ left: 0, right: 0 });
  const [showResults, setShowResults] = useState(false);
  const [endedEvents, setEndedEvents] = useState<Record<string, { leftPercent: number; rightPercent: number }>>({});
  const [userVote, setUserVote] = useState<'left' | 'right' | null>(null);
  const [finalResults, setFinalResults] = useState<{ leftPercent: number; rightPercent: number } | null>(null);

  // Setup notifications (only on native platforms)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Dynamic import ensures the web-server doesn't touch this code
      const setupNotifications = async () => {
        const Notifications = await import('expo-notifications');

        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowList: true,
          }),
        });

        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Notification permissions not granted');
        }
      };

      setupNotifications();
    }
  }, []);

  const addVote = (side: 'left' | 'right') => {
    setVotes(prev => ({ ...prev, [side]: prev[side] + 1 }));
    setUserVote(side);
  };

  const endEvent = (eventId: string) => {
    // Generate mock percentages for now
    const left = Math.floor(Math.random() * 100);
    const right = 100 - left;
    console.log(`Ending event ${eventId} with results: Left ${left}%, Right ${right}%`);
    setEndedEvents(prev => ({
      ...prev,
      [eventId]: { leftPercent: left, rightPercent: right }
    }));
  };

  const endDay = async () => {
    // Generate random final results
    const leftVotes = Math.floor(Math.random() * 1000) + 100;
    const rightVotes = Math.floor(Math.random() * 1000) + 100;
    const totalVotes = leftVotes + rightVotes;
    const leftPercent = Math.round((leftVotes / totalVotes) * 100);
    const rightPercent = 100 - leftPercent;
    
    setFinalResults({ leftPercent, rightPercent });
    setShowResults(true);
    
    // Send notification to user about results (only on native platforms)
    if (Platform.OS !== 'web' && userVote && dailyQuestion) {
      // Dynamically import here as well
      const Notifications = await import('expo-notifications');
      
      // User wins if they voted for the side with MORE votes (majority)
      const userWon = (userVote === 'left' && leftVotes > rightVotes) || (userVote === 'right' && rightVotes > leftVotes);
      console.log('User won:', userVote, leftVotes, rightVotes, '=>', userWon, leftPercent, rightPercent);
      const winningOption = leftVotes > rightVotes ? dailyQuestion.left : dailyQuestion.right;
      
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
          `oof that didn't age well... 😅`,
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

  const initializeDailyQuestion = () => {
    if (currentUser && currentUser.preferences) {
      const preferences = currentUser.preferences;
      
      // Get all categories and their weights
      const categories = Object.keys(preferences);
      const weights = Object.values(preferences) as number[];
      
      // Weighted random selection of category
      const totalWeight = weights.reduce((sum: number, weight: number) => sum + weight, 0);
      let random = Math.random() * totalWeight;
      
      let selectedCategory = categories[0];
      for (let i = 0; i < categories.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          selectedCategory = categories[i];
          break;
        }
      }
      
      // Load questions from mock data for the selected category
      const mockData = require('../assets/mock_data.json');
      const categoryQuestions = mockData.hot_takes.filter((q: any) => 
        !q.is_identity && q.category_id === selectedCategory
      );
      
      if (categoryQuestions.length > 0) {
        // Pick a random question from the selected category
        const randomQuestion = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
        
        setDailyQuestion({
          question: randomQuestion.question_text,
          left: randomQuestion.option_1,
          right: randomQuestion.option_2
        });
      } else {
        // Fallback to a default question if category has no questions
        setDailyQuestion({
          question: 'Coffee vs Tea',
          left: 'Coffee',
          right: 'Tea'
        });
      }
    } else {
      // Fallback if no user preferences available
      setDailyQuestion({
        question: 'Coffee vs Tea',
        left: 'Coffee',
        right: 'Tea'
      });
    }
  };

  const newDay = () => {
    setShowResults(false);
    setFinalResults(null);
    initializeDailyQuestion();
    setVotes({ left: 0, right: 0 }); // Reset votes for new day
    setUserVote(null); // Reset user vote
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

  // Initialize daily question when current user is set
  useEffect(() => {
    if (currentUser) {
      initializeDailyQuestion();
    }
  }, [currentUser]);

  return (
    <UserContext.Provider value={{ currentUser, allUsers, setCurrentUser, dailyQuestion, votes, finalResults, setDailyQuestion, addVote, endDay, newDay, showResults, setShowResults, rsvpToEvent, endedEvents, endEvent }}>
      {children}
    </UserContext.Provider>
  );
};