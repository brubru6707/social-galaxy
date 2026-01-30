import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import mockData from '../../assets/mock_data.json';

export default function ExploreScreen() {
  const allEvents = mockData.events || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerWrap}>
          <Text style={styles.logo}>Explore</Text>
        </View>
        {allEvents.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <Image source={{ uri: event.event_picture }} style={styles.eventImage} />
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventInfo}>{event.location}</Text>
          </View>
        ))}
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
    marginBottom: 30,
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
  eventCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 18,
    width: width * 0.9,
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    alignSelf: 'center',
  },
  eventImage: {
    width: '100%',
    height: 110,
    borderRadius: 18,
    marginBottom: 12,
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
});
