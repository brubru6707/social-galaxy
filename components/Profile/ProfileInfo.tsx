import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileInfo({ userData, onShare, onEdit }: any) {
  return (
    <View collapsable={false} style={{ backgroundColor: 'transparent' }}>
      <View style={styles.profileContainer}>
        {/* Gear Icon at top right */}
        <TouchableOpacity style={styles.gearButton} onPress={onEdit}>
          <IconSymbol size={24} name="gear" color="#fff" />
        </TouchableOpacity>
        {/* Profile Picture */}
        <View style={styles.profilePictureContainer}>
          <Image source={{ uri: userData.profile_picture }} style={styles.profilePicture} />
        </View>
        {/* Name */}
        <View style={styles.nameContainer}>
          <Text style={styles.firstName}>{userData.firstName}</Text>
          <Text style={styles.lastName}>{userData.lastName}</Text>
        </View>
        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton} onPress={onEdit}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={onShare}>
            <Text style={styles.shareButtonText}>Share Profile</Text>
          </TouchableOpacity>
        </View>
        {/* Date Joined and Mutuals */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Joined</Text>
            <Text style={styles.infoValue}>{userData.dateJoined}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Mutuals</Text>
            <Text style={styles.infoValue}>{userData.mutuals}</Text>
          </View>
        </View>
        {/* Bio Section */}
        <View style={styles.bioContainer}>
          <Text style={styles.bio}>{userData.bio}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileContainer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  gearButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 10,
  },
  profilePictureContainer: {
    marginBottom: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  firstName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  lastName: {
    fontSize: 24,
    color: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  editButton: {
    backgroundColor: '#4455aa',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginRight: 15,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shareButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  bioContainer: {
    width: '100%',
    marginBottom: 30,
  },
  bio: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
    textAlign: 'center',
  },
});
