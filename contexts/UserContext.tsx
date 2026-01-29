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
    <UserContext.Provider value={{ currentUser, allUsers, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};