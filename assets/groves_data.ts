// Groves Data - Niche Communities
// Each grove represents a niche community users can join through event attendance

export interface Grove {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: string; // Maps to event title keywords
  keywords: string[]; // Keywords to match events
  color: string; // Theme color for the grove
  memberCount: number;
  members: string[]; // User IDs
  accessRules: {
    minEventsAttended: number; // Events needed to unlock
    autoJoin: boolean;
  };
  exclusiveEvents: string[]; // Event IDs only for members
}

export interface GroveProfile {
  groveId: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  visibleHotTakes: string[]; // Question IDs to show in this grove context
}

export interface UserGroveData {
  userId: string;
  groves: string[]; // Grove IDs user belongs to
  pendingGroves: string[]; // Groves user is close to unlocking
  groveProfiles: GroveProfile[];
  eventsByCategory: Record<string, number>; // Category -> count
}

// Initial groves for the demo
export const GROVES: Grove[] = [
  {
    id: 'grove_tech',
    name: 'Tech Grove',
    emoji: '💻',
    description: 'For hackers, builders, and tech enthusiasts. Discuss the latest in tech, share projects, and find collaborators.',
    category: 'tech',
    keywords: ['hackathon', 'tech', 'coding', 'developer', 'startup'],
    color: '#6366F1', // Indigo
    memberCount: 127,
    members: ['u_0', 'u_2', 'u_5', 'u_8', 'u_12', 'u_15', 'u_18', 'u_21', 'u_24', 'u_28'],
    accessRules: {
      minEventsAttended: 2,
      autoJoin: true,
    },
    exclusiveEvents: ['evt_0', 'evt_1', 'evt_2'],
  },
  {
    id: 'grove_gaming',
    name: 'Gaming Grove',
    emoji: '🎮',
    description: 'Level up your social life. LAN parties, game nights, and esports watch parties.',
    category: 'gaming',
    keywords: ['gaming', 'game', 'esports', 'lan', 'minecraft', 'terraria'],
    color: '#10B981', // Emerald
    memberCount: 89,
    members: ['u_0', 'u_3', 'u_7', 'u_11', 'u_14', 'u_19', 'u_23', 'u_27'],
    accessRules: {
      minEventsAttended: 2,
      autoJoin: true,
    },
    exclusiveEvents: [],
  },
  {
    id: 'grove_crypto',
    name: 'Crypto Grove',
    emoji: '🪙',
    description: 'Web3 builders, crypto enthusiasts, and blockchain believers. WAGMI.',
    category: 'crypto',
    keywords: ['crypto', 'blockchain', 'web3', 'nft', 'defi', 'bitcoin', 'ethereum'],
    color: '#F59E0B', // Amber
    memberCount: 54,
    members: ['u_4', 'u_9', 'u_16', 'u_22', 'u_31'],
    accessRules: {
      minEventsAttended: 1,
      autoJoin: false, // Requires explicit join
    },
    exclusiveEvents: [],
  },
  {
    id: 'grove_fitness',
    name: 'Fitness Grove',
    emoji: '💪',
    description: 'Get fit together. Running clubs, gym sessions, yoga, and outdoor adventures.',
    category: 'fitness',
    keywords: ['fitness', 'gym', 'run', 'yoga', 'workout', 'sports', 'hike'],
    color: '#EF4444', // Red
    memberCount: 76,
    members: ['u_1', 'u_6', 'u_10', 'u_17', 'u_25', 'u_29', 'u_33'],
    accessRules: {
      minEventsAttended: 2,
      autoJoin: true,
    },
    exclusiveEvents: [],
  },
  {
    id: 'grove_foodies',
    name: 'Foodies Grove',
    emoji: '🍕',
    description: 'For those who live to eat. Dinners, cooking classes, food crawls, and tastings.',
    category: 'food',
    keywords: ['food', 'dinner', 'cooking', 'pizza', 'restaurant', 'tasting', 'brunch'],
    color: '#F97316', // Orange
    memberCount: 93,
    members: ['u_2', 'u_8', 'u_13', 'u_20', 'u_26', 'u_30', 'u_35'],
    accessRules: {
      minEventsAttended: 2,
      autoJoin: true,
    },
    exclusiveEvents: [],
  },
  {
    id: 'grove_creatives',
    name: 'Creatives Grove',
    emoji: '🎨',
    description: 'Artists, designers, musicians, and makers. Create, collaborate, inspire.',
    category: 'creative',
    keywords: ['art', 'design', 'music', 'creative', 'paint', 'draw', 'jam'],
    color: '#EC4899', // Pink
    memberCount: 61,
    members: ['u_5', 'u_12', 'u_18', 'u_24', 'u_32', 'u_37'],
    accessRules: {
      minEventsAttended: 2,
      autoJoin: true,
    },
    exclusiveEvents: [],
  },
  {
    id: 'grove_nightowls',
    name: 'Night Owls Grove',
    emoji: '🌙',
    description: 'The after-hours crew. Late night events, parties, and spontaneous adventures.',
    category: 'nightlife',
    keywords: ['night', 'late', 'party', 'club', 'bar', 'midnight'],
    color: '#8B5CF6', // Violet
    memberCount: 112,
    members: ['u_0', 'u_3', 'u_7', 'u_11', 'u_15', 'u_19', 'u_23', 'u_27', 'u_31', 'u_35', 'u_39'],
    accessRules: {
      minEventsAttended: 3,
      autoJoin: true,
    },
    exclusiveEvents: ['evt_0'], // Late Night Hackathon
  },
  {
    id: 'grove_study',
    name: 'Study Grove',
    emoji: '📚',
    description: 'Focused study sessions, accountability partners, and academic support.',
    category: 'study',
    keywords: ['study', 'library', 'exam', 'homework', 'academic', 'session'],
    color: '#3B82F6', // Blue
    memberCount: 84,
    members: ['u_0', 'u_4', 'u_8', 'u_12', 'u_16', 'u_20', 'u_24', 'u_28', 'u_32', 'u_36'],
    accessRules: {
      minEventsAttended: 2,
      autoJoin: true,
    },
    exclusiveEvents: ['evt_5', 'evt_15'],
  },
];

// Helper function to detect which groves a user qualifies for based on events
export function detectUserGroves(
  userEvents: any[],
  allGroves: Grove[]
): { qualified: Grove[]; pending: Grove[]; progress: Record<string, number> } {
  // Count events by grove category
  const categoryCount: Record<string, number> = {};
  
  userEvents.forEach(event => {
    const title = (event.title || '').toLowerCase();
    const description = (event.description || '').toLowerCase();
    
    allGroves.forEach(grove => {
      const matchesKeyword = grove.keywords.some(
        keyword => title.includes(keyword) || description.includes(keyword)
      );
      
      if (matchesKeyword) {
        categoryCount[grove.id] = (categoryCount[grove.id] || 0) + 1;
      }
    });
  });
  
  const qualified: Grove[] = [];
  const pending: Grove[] = [];
  
  allGroves.forEach(grove => {
    const count = categoryCount[grove.id] || 0;
    const needed = grove.accessRules.minEventsAttended;
    
    if (count >= needed) {
      qualified.push(grove);
    } else if (count > 0 && count < needed) {
      pending.push(grove);
    }
  });
  
  return { qualified, pending, progress: categoryCount };
}

// Get grove-specific profile or default
export function getGroveProfile(
  userId: string,
  groveId: string,
  groveProfiles: GroveProfile[]
): GroveProfile | null {
  return groveProfiles.find(p => p.groveId === groveId) || null;
}

// Check if event is accessible to user based on grove membership
export function canAccessEvent(
  event: any,
  userGroves: string[],
  allGroves: Grove[]
): { canAccess: boolean; requiredGrove?: Grove } {
  // Check if event is in any grove's exclusive list
  for (const grove of allGroves) {
    if (grove.exclusiveEvents.includes(event.id)) {
      if (userGroves.includes(grove.id)) {
        return { canAccess: true };
      } else {
        return { canAccess: false, requiredGrove: grove };
      }
    }
  }
  
  // Not exclusive to any grove
  return { canAccess: true };
}

// Mock user grove data for demo
export const MOCK_USER_GROVE_DATA: UserGroveData[] = [
  {
    userId: 'u_0', // Bruno - the current user
    groves: ['grove_tech', 'grove_gaming', 'grove_study'],
    pendingGroves: ['grove_nightowls'], // Close to unlocking
    groveProfiles: [
      {
        groveId: 'grove_tech',
        displayName: 'Bruno 💻',
        bio: 'Full-stack dev, hackathon enthusiast',
        visibleHotTakes: ['ht_1', 'ht_5'], // Coffee, Frontend/Backend
      },
      {
        groveId: 'grove_gaming',
        displayName: 'BrunoGamer',
        bio: 'Minecraft veteran, down for any game night',
        visibleHotTakes: ['ht_2'], // Minecraft vs Terraria
      },
    ],
    eventsByCategory: {
      grove_tech: 3,
      grove_gaming: 2,
      grove_study: 2,
      grove_nightowls: 2, // Needs 3 for Night Owls
    },
  },
];

export default GROVES;
