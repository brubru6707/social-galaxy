// This file exports the mock data previously in mock_data.json
// so it can be imported in Expo/React Native projects.

import type { User } from '../contexts/UserContext';

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  host: string;
  total_spots: number;
  spots_taken: number;
  cost_per_person: number;
  rsvp_deadline: string;
  event_picture: string;
  attendees: string[];
}

// Paste the content of mock_data.json here, but only the users and events arrays for brevity
// ...

// For now, just export empty arrays as placeholders
export const users: User[] = [];
export const events: Event[] = [];

export default { users, events };
