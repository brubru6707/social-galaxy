import React, { createContext, useContext, useEffect, useState } from 'react';
import GROVES, { 
  Grove, 
  GroveProfile, 
  UserGroveData, 
  MOCK_USER_GROVE_DATA,
  detectUserGroves,
  canAccessEvent,
} from '../assets/groves_data';
import { useUser } from './UserContext';

interface GroveContextType {
  // All available groves
  allGroves: Grove[];
  
  // Current user's grove memberships
  userGroves: Grove[];
  pendingGroves: Grove[]; // Groves user is close to unlocking
  discoveryGroves: Grove[]; // Groves user hasn't started on
  
  // Progress tracking
  groveProgress: Record<string, number>; // groveId -> events attended
  
  // Grove profiles
  groveProfiles: GroveProfile[];
  activeGroveContext: string | null; // Currently viewing in grove context
  
  // Actions
  joinGrove: (groveId: string) => void;
  leaveGrove: (groveId: string) => void;
  setActiveGroveContext: (groveId: string | null) => void;
  updateGroveProfile: (profile: GroveProfile) => void;
  
  // Helpers
  getGroveById: (groveId: string) => Grove | undefined;
  isGroveMember: (groveId: string) => boolean;
  canAccessEvent: (event: any) => { canAccess: boolean; requiredGrove?: Grove };
  getGroveProfile: (groveId: string) => GroveProfile | null;
  
  // Unlock animation state
  newlyUnlockedGrove: Grove | null;
  clearUnlockedGrove: () => void;
}

const GroveContext = createContext<GroveContextType | undefined>(undefined);

export const useGrove = () => {
  const context = useContext(GroveContext);
  if (!context) {
    throw new Error('useGrove must be used within a GroveProvider');
  }
  return context;
};

export const GroveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useUser();
  
  const [allGroves] = useState<Grove[]>(GROVES);
  const [userGroveIds, setUserGroveIds] = useState<string[]>([]);
  const [pendingGroveIds, setPendingGroveIds] = useState<string[]>([]);
  const [groveProgress, setGroveProgress] = useState<Record<string, number>>({});
  const [groveProfiles, setGroveProfiles] = useState<GroveProfile[]>([]);
  const [activeGroveContext, setActiveGroveContext] = useState<string | null>(null);
  const [newlyUnlockedGrove, setNewlyUnlockedGrove] = useState<Grove | null>(null);
  
  // Initialize user grove data when user changes
  useEffect(() => {
    if (currentUser) {
      // Find mock data for this user or detect from events
      const mockData = MOCK_USER_GROVE_DATA.find(d => d.userId === currentUser.id);
      
      if (mockData) {
        setUserGroveIds(mockData.groves);
        setPendingGroveIds(mockData.pendingGroves);
        setGroveProfiles(mockData.groveProfiles);
        setGroveProgress(mockData.eventsByCategory);
      } else {
        // Detect from user's events
        const { qualified, pending, progress } = detectUserGroves(
          currentUser.events_gone_to || [],
          allGroves
        );
        setUserGroveIds(qualified.map(g => g.id));
        setPendingGroveIds(pending.map(g => g.id));
        setGroveProgress(progress);
        setGroveProfiles([]);
      }
    }
  }, [currentUser, allGroves]);
  
  // Computed values
  const userGroves = allGroves.filter(g => userGroveIds.includes(g.id));
  const pendingGroves = allGroves.filter(g => pendingGroveIds.includes(g.id));
  const discoveryGroves = allGroves.filter(
    g => !userGroveIds.includes(g.id) && !pendingGroveIds.includes(g.id)
  );
  
  // Actions
  const joinGrove = (groveId: string) => {
    const grove = allGroves.find(g => g.id === groveId);
    if (!grove) return;
    
    // Check if user qualifies
    const progress = groveProgress[groveId] || 0;
    if (progress >= grove.accessRules.minEventsAttended) {
      setUserGroveIds(prev => [...prev, groveId]);
      setPendingGroveIds(prev => prev.filter(id => id !== groveId));
      setNewlyUnlockedGrove(grove);
    }
  };
  
  const leaveGrove = (groveId: string) => {
    setUserGroveIds(prev => prev.filter(id => id !== groveId));
    // Move back to pending if user still has progress
    const progress = groveProgress[groveId] || 0;
    if (progress > 0) {
      setPendingGroveIds(prev => [...prev, groveId]);
    }
  };
  
  const updateGroveProfile = (profile: GroveProfile) => {
    setGroveProfiles(prev => {
      const existing = prev.findIndex(p => p.groveId === profile.groveId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = profile;
        return updated;
      }
      return [...prev, profile];
    });
  };
  
  const clearUnlockedGrove = () => {
    setNewlyUnlockedGrove(null);
  };
  
  // Helpers
  const getGroveById = (groveId: string) => allGroves.find(g => g.id === groveId);
  
  const isGroveMember = (groveId: string) => userGroveIds.includes(groveId);
  
  const checkEventAccess = (event: any) => {
    return canAccessEvent(event, userGroveIds, allGroves);
  };
  
  const getGroveProfileFn = (groveId: string): GroveProfile | null => {
    return groveProfiles.find(p => p.groveId === groveId) || null;
  };
  
  return (
    <GroveContext.Provider
      value={{
        allGroves,
        userGroves,
        pendingGroves,
        discoveryGroves,
        groveProgress,
        groveProfiles,
        activeGroveContext,
        joinGrove,
        leaveGrove,
        setActiveGroveContext,
        updateGroveProfile,
        getGroveById,
        isGroveMember,
        canAccessEvent: checkEventAccess,
        getGroveProfile: getGroveProfileFn,
        newlyUnlockedGrove,
        clearUnlockedGrove,
      }}
    >
      {children}
    </GroveContext.Provider>
  );
};
