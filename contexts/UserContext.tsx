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

  const addVote = (side: 'left' | 'right') => {
    setVotes(prev => ({ ...prev, [side]: prev[side] + 1 }));
  };

  const endDay = () => {
    setShowResults(true);
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
    <UserContext.Provider value={{ currentUser, allUsers, setCurrentUser, dailyQuestion, votes, setDailyQuestion, addVote, endDay, newDay, showResults, setShowResults }}>
      {children}
    </UserContext.Provider>
  );
};