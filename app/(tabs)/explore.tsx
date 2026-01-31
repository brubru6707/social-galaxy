import React, { useState, useMemo } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import mockData from '../../assets/mock_data.json';
import AnimatedLiquidGradient from '../../components/AnimatedLiquidGradient';
import { useGrove } from '@/contexts/GroveContext';
import GROVES from '@/assets/groves_data';

export default function ExploreScreen() {
  const allEvents = mockData.events || [];
  const { userGroves, canAccessEvent, isGroveMember } = useGrove();
  const [selectedGroveFilter, setSelectedGroveFilter] = useState<string | null>(null);
  
  // Check which groves an event belongs to based on keywords
  const getEventGroves = (event: any) => {
    const title = (event.title || '').toLowerCase();
    const description = (event.description || '').toLowerCase();
    
    return GROVES.filter(grove => 
      grove.keywords.some(keyword => 
        title.includes(keyword) || description.includes(keyword)
      )
    );
  };
  
  // Filter events based on selected grove
  const filteredEvents = useMemo(() => {
    if (!selectedGroveFilter) return allEvents;
    
    return allEvents.filter(event => {
      const eventGroves = getEventGroves(event);
      return eventGroves.some(g => g.id === selectedGroveFilter);
    });
  }, [allEvents, selectedGroveFilter]);

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedLiquidGradient />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerWrap}>
          <Text style={styles.logo}>Explore</Text>
        </View>
        
        {/* Grove Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              !selectedGroveFilter && styles.filterChipActive
            ]}
            onPress={() => setSelectedGroveFilter(null)}
          >
            <Text style={[
              styles.filterChipText,
              !selectedGroveFilter && styles.filterChipTextActive
            ]}>
              All Events
            </Text>
          </TouchableOpacity>
          
          {userGroves.map(grove => (
            <TouchableOpacity
              key={grove.id}
              style={[
                styles.filterChip,
                selectedGroveFilter === grove.id && styles.filterChipActive,
                { borderColor: grove.color }
              ]}
              onPress={() => setSelectedGroveFilter(
                selectedGroveFilter === grove.id ? null : grove.id
              )}
            >
              <Text style={styles.filterEmoji}>{grove.emoji}</Text>
              <Text style={[
                styles.filterChipText,
                selectedGroveFilter === grove.id && styles.filterChipTextActive
              ]}>
                {grove.name.replace(' Grove', '')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Events List */}
        {filteredEvents.map((event) => {
          const access = canAccessEvent(event);
          const eventGroves = getEventGroves(event);
          
          return (
            <View key={event.id} style={styles.eventCard}>
              {/* Grove Badges */}
              {eventGroves.length > 0 && (
                <View style={styles.groveBadgesContainer}>
                  {eventGroves.slice(0, 2).map(grove => (
                    <View 
                      key={grove.id} 
                      style={[
                        styles.groveBadge,
                        { backgroundColor: grove.color + '30', borderColor: grove.color }
                      ]}
                    >
                      <Text style={styles.groveBadgeEmoji}>{grove.emoji}</Text>
                      {isGroveMember(grove.id) && (
                        <Text style={[styles.groveBadgeText, { color: grove.color }]}>
                          {grove.name.replace(' Grove', '')}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
              
              {/* Access Lock Indicator */}
              {!access.canAccess && access.requiredGrove && (
                <View style={styles.lockOverlay}>
                  <View style={styles.lockBadge}>
                    <Text style={styles.lockIcon}>🔒</Text>
                    <Text style={styles.lockText}>
                      {access.requiredGrove.name} Only
                    </Text>
                  </View>
                </View>
              )}
              
              <Image 
                source={{ uri: event.event_picture }} 
                style={[
                  styles.eventImage,
                  !access.canAccess && styles.eventImageLocked
                ]} 
              />
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventInfo}>{event.location}</Text>
              
              {/* Exclusive Event Badge */}
              {!access.canAccess && (
                <View style={styles.exclusiveBadge}>
                  <Text style={styles.exclusiveBadgeText}>
                    Join {access.requiredGrove?.emoji} to unlock
                  </Text>
                </View>
              )}
            </View>
          );
        })}
        
        {filteredEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No events in this grove yet</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerWrap: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  logo: {
    fontSize: 38,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'lowercase',
    fontFamily: 'Avenir-Black',
    textAlign: 'left',
  },
  filterContainer: {
    marginBottom: 20,
    marginHorizontal: -20,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  filterChipText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#000',
  },
  filterEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  eventCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 18,
    width: width * 0.9,
    backgroundColor: '#111',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  groveBadgesContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    zIndex: 10,
    gap: 6,
  },
  groveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  groveBadgeEmoji: {
    fontSize: 12,
  },
  groveBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  lockIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  lockText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '600',
  },
  eventImage: {
    width: '100%',
    height: 110,
    borderRadius: 18,
    marginBottom: 12,
  },
  eventImageLocked: {
    opacity: 0.5,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  eventInfo: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 2,
  },
  exclusiveBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(245,158,11,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  exclusiveBadgeText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
});
