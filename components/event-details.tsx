import { useUser } from '@/contexts/UserContext';
import { useGrove } from '@/contexts/GroveContext';
import GROVES, { Grove } from '@/assets/groves_data';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GroveDetail from './grove-detail';

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
  const { currentUser, rsvpToEvent } = useUser();
  const { canAccessEvent, isGroveMember } = useGrove();
  const isUserAttending = currentUser && currentUser.events_gone_to.includes(event.id);
  const [goingPressed, setGoingPressed] = useState(false);
  const [selectedGrove, setSelectedGrove] = useState<Grove | null>(null);
  
  // Get groves this event belongs to
  const getEventGroves = () => {
    const title = (event.title || '').toLowerCase();
    const description = (event.description || '').toLowerCase();
    
    return GROVES.filter(grove => 
      grove.keywords.some(keyword => 
        title.includes(keyword) || description.includes(keyword)
      )
    );
  };
  
  const eventGroves = getEventGroves();
  const access = canAccessEvent(event);

  // Handle RSVP directly without hot take modal
  const handleGoingPress = () => {
    if (!isUserAttending && !goingPressed && access.canAccess) {
      setGoingPressed(true);
      if (currentUser) {
        rsvpToEvent(event.id);
      }
    }
  };

  return (
    <>
    <ScrollView contentContainerStyle={[styles.container, (isUserAttending || goingPressed) && styles.darkerBg]}>
      {event.event_picture && (
        <Image source={{ uri: event.event_picture }} style={styles.image} />
      )}
      <Text style={styles.title}>{event.title}</Text>
      
      {/* Grove Badges - Clickable */}
      {eventGroves.length > 0 && (
        <View style={styles.groveBadgesRow}>
          {eventGroves.map(grove => (
            <TouchableOpacity 
              key={grove.id}
              onPress={() => setSelectedGrove(grove)}
              activeOpacity={0.7}
              style={[
                styles.groveBadgeDetail,
                { 
                  backgroundColor: grove.color + '20',
                  borderColor: isGroveMember(grove.id) ? grove.color : 'transparent'
                }
              ]}
            >
              <Text style={styles.groveBadgeEmoji}>{grove.emoji}</Text>
              <Text style={[styles.groveBadgeText, { color: grove.color }]}>
                {grove.name}
              </Text>
              {isGroveMember(grove.id) && (
                <Text style={styles.memberCheck}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {/* Access Restriction Notice */}
      {!access.canAccess && access.requiredGrove && (
        <View style={styles.accessRestriction}>
          <Text style={styles.accessIcon}>🔒</Text>
          <View>
            <Text style={styles.accessTitle}>Grove-Exclusive Event</Text>
            <Text style={styles.accessSubtitle}>
              Join {access.requiredGrove.name} to RSVP
            </Text>
          </View>
        </View>
      )}
      
      {/* RSVP confirmation */}
      {goingPressed && (
        <View style={styles.rsvpConfirmation}>
          <Text style={styles.rsvpConfirmationText}>You're going!</Text>
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
            { backgroundColor: access.canAccess ? '#4CAF50' : '#4B5563' },
            (isUserAttending || goingPressed) && styles.selectedButton
          ]}
          onPress={handleGoingPress}
          disabled={isUserAttending || goingPressed || !access.canAccess}
        >
          <Text style={styles.rsvpButtonText}>
            {access.canAccess ? 'Going' : '🔒'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.rsvpButton,
            { backgroundColor: access.canAccess ? '#FF9800' : '#4B5563' }
          ]}
          disabled={!access.canAccess}
        >
          <Text style={styles.rsvpButtonText}>
            {access.canAccess ? 'Maybe' : '🔒'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.rsvpButton,
            { backgroundColor: '#F44336' }
          ]}
        >
          <Text style={styles.rsvpButtonText}>Can't Go</Text>
        </TouchableOpacity>
      </View>

      </ScrollView>
      
      {/* Grove Detail Modal */}
      <Modal
        visible={selectedGrove !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedGrove(null)}
      >
        {selectedGrove && (
          <GroveDetail
            grove={selectedGrove}
            onClose={() => setSelectedGrove(null)}
          />
        )}
      </Modal>
    </>
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
  rsvpConfirmation: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  rsvpConfirmationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  groveBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  groveBadgeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  groveBadgeEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  groveBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  memberCheck: {
    fontSize: 10,
    color: '#10B981',
    marginLeft: 4,
  },
  accessRestriction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  accessIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  accessTitle: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '600',
  },
  accessSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
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
