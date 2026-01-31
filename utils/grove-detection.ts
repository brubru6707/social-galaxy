/**
 * Grove Detection Algorithm
 * 
 * Detects user niches based on event attendance patterns
 * and determines grove eligibility.
 */

import { Grove, GROVES } from '@/assets/groves_data';

export interface EventCategory {
  category: string;
  count: number;
}

export interface GroveEligibility {
  grove: Grove;
  eventsAttended: number;
  eventsRequired: number;
  isEligible: boolean;
  eventsAway: number; // How many more events needed
}

/**
 * Count events by category based on event title and description matching
 */
export function countEventsByCategory(
  userEvents: any[],
  groves: Grove[] = GROVES
): Record<string, number> {
  const categoryCount: Record<string, number> = {};
  
  userEvents.forEach(event => {
    const title = (event.title || '').toLowerCase();
    const description = (event.description || '').toLowerCase();
    
    groves.forEach(grove => {
      const matchesKeyword = grove.keywords.some(
        keyword => title.includes(keyword) || description.includes(keyword)
      );
      
      if (matchesKeyword) {
        categoryCount[grove.id] = (categoryCount[grove.id] || 0) + 1;
      }
    });
  });
  
  return categoryCount;
}

/**
 * Detect which groves a user qualifies for based on their event attendance
 */
export function detectUserGroves(
  userEvents: any[],
  groves: Grove[] = GROVES
): { qualified: Grove[]; pending: Grove[]; progress: Record<string, number> } {
  const progress = countEventsByCategory(userEvents, groves);
  
  const qualified: Grove[] = [];
  const pending: Grove[] = [];
  
  groves.forEach(grove => {
    const count = progress[grove.id] || 0;
    const needed = grove.accessRules.minEventsAttended;
    
    if (count >= needed) {
      qualified.push(grove);
    } else if (count > 0 && count < needed) {
      pending.push(grove);
    }
  });
  
  return { qualified, pending, progress };
}

/**
 * Get groves user is close to qualifying for (within threshold)
 */
export function suggestGroves(
  userEvents: any[],
  groves: Grove[] = GROVES,
  threshold: number = 1 // Default: 1 event away
): Grove[] {
  const progress = countEventsByCategory(userEvents, groves);
  
  return groves.filter(grove => {
    const count = progress[grove.id] || 0;
    const needed = grove.accessRules.minEventsAttended;
    const eventsAway = needed - count;
    
    // User has some progress but not enough, and within threshold
    return count > 0 && count < needed && eventsAway <= threshold;
  });
}

/**
 * Get detailed eligibility info for all groves
 */
export function getGroveEligibility(
  userEvents: any[],
  groves: Grove[] = GROVES
): GroveEligibility[] {
  const progress = countEventsByCategory(userEvents, groves);
  
  return groves.map(grove => {
    const eventsAttended = progress[grove.id] || 0;
    const eventsRequired = grove.accessRules.minEventsAttended;
    const isEligible = eventsAttended >= eventsRequired;
    const eventsAway = Math.max(0, eventsRequired - eventsAttended);
    
    return {
      grove,
      eventsAttended,
      eventsRequired,
      isEligible,
      eventsAway,
    };
  });
}

/**
 * Get the dominant niche for a user based on most attended category
 */
export function getDominantNiche(
  userEvents: any[],
  groves: Grove[] = GROVES
): Grove | null {
  const progress = countEventsByCategory(userEvents, groves);
  
  let maxCount = 0;
  let dominantGrove: Grove | null = null;
  
  groves.forEach(grove => {
    const count = progress[grove.id] || 0;
    if (count > maxCount) {
      maxCount = count;
      dominantGrove = grove;
    }
  });
  
  return dominantGrove;
}

/**
 * Check if an event belongs to a specific grove
 */
export function eventBelongsToGrove(event: any, grove: Grove): boolean {
  const title = (event.title || '').toLowerCase();
  const description = (event.description || '').toLowerCase();
  
  return grove.keywords.some(
    keyword => title.includes(keyword) || description.includes(keyword)
  );
}

/**
 * Get all groves an event belongs to
 */
export function getEventGroves(
  event: any,
  groves: Grove[] = GROVES
): Grove[] {
  return groves.filter(grove => eventBelongsToGrove(event, grove));
}

/**
 * Calculate grove affinity score (0-100) for a user
 * Based on how many events they've attended in that category
 */
export function calculateGroveAffinity(
  userEvents: any[],
  grove: Grove
): number {
  const progress = countEventsByCategory(userEvents, [grove]);
  const count = progress[grove.id] || 0;
  const required = grove.accessRules.minEventsAttended;
  
  // Score is percentage of required events attended, capped at 100
  return Math.min(100, Math.round((count / required) * 100));
}

export default {
  countEventsByCategory,
  detectUserGroves,
  suggestGroves,
  getGroveEligibility,
  getDominantNiche,
  eventBelongsToGrove,
  getEventGroves,
  calculateGroveAffinity,
};
