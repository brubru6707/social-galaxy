import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Grove, GroveProfile } from '@/assets/groves_data';
import { useUser } from '@/contexts/UserContext';
import { useGrove } from '@/contexts/GroveContext';

interface GroveProfileEditorProps {
  grove: Grove;
  visible: boolean;
  onClose: () => void;
  onSave: (profile: GroveProfile) => void;
}

export default function GroveProfileEditor({
  grove,
  visible,
  onClose,
  onSave,
}: GroveProfileEditorProps) {
  const { currentUser } = useUser();
  const { getGroveProfile } = useGrove();
  
  const existingProfile = getGroveProfile(grove.id);
  
  // Form state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  
  // Initialize form with existing profile or defaults
  useEffect(() => {
    if (existingProfile) {
      setDisplayName(existingProfile.displayName || '');
      setBio(existingProfile.bio || '');
    } else {
      setDisplayName(currentUser?.name || '');
      setBio(currentUser?.bio || '');
    }
  }, [existingProfile, currentUser, visible]);
  
  const handleSave = () => {
    const profile: GroveProfile = {
      groveId: grove.id,
      displayName: displayName || undefined,
      bio: bio || undefined,
    };
    onSave(profile);
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Grove Context Banner */}
          <LinearGradient
            colors={[grove.color + '40', grove.color + '10']}
            style={styles.groveBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.groveEmoji}>{grove.emoji}</Text>
            <View>
              <Text style={styles.groveTitle}>{grove.name} Profile</Text>
              <Text style={styles.groveSubtitle}>
                Customize how you appear to other members
              </Text>
            </View>
          </LinearGradient>
          
          {/* Profile Picture Preview */}
          <View style={styles.profilePreview}>
            <Image
              source={{ uri: currentUser?.profile_picture }}
              style={styles.profilePicture}
            />
            <Text style={styles.profilePreviewHint}>
              Profile picture is shared across all groves
            </Text>
          </View>
          
          {/* Display Name */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Display Name</Text>
            <Text style={styles.inputHint}>
              How your name appears in this grove
            </Text>
            <TextInput
              style={styles.textInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={currentUser?.name || 'Your name'}
              placeholderTextColor="#6B7280"
            />
          </View>
          
          {/* Bio */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Grove Bio</Text>
            <Text style={styles.inputHint}>
              A short bio relevant to this community
            </Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder={currentUser?.bio || 'Tell others about yourself...'}
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={3}
            />
          </View>
          
          {/* Preview Section */}
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Preview</Text>
            <Text style={styles.previewHint}>
              This is how other {grove.name} members will see your profile
            </Text>
            
            <View style={styles.previewCard}>
              <Image
                source={{ uri: currentUser?.profile_picture }}
                style={styles.previewAvatar}
              />
              <Text style={styles.previewName}>
                {displayName || currentUser?.name}
              </Text>
              <Text style={styles.previewBio}>
                {bio || currentUser?.bio || 'No bio set'}
              </Text>
              
              {/* Recent Events Preview */}
              <View style={styles.previewEvents}>
                <Text style={styles.previewEventsTitle}>Recent Events</Text>
                {currentUser?.events_gone_to?.slice(0, 2).map((evt: any, idx: number) => (
                  <Text key={idx} style={styles.previewEvent}>
                    {evt.title}
                  </Text>
                ))}
              </View>
            </View>
          </View>
          
          <View style={{ height: 50 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  cancelButton: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  saveButton: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  groveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  groveEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  groveTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  groveSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 2,
  },
  profilePreview: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFD700',
    marginBottom: 8,
  },
  profilePreviewHint: {
    color: '#6B7280',
    fontSize: 12,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  inputHint: {
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  previewSection: {
    marginTop: 8,
  },
  previewTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewHint: {
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  previewAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  previewName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewBio: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  previewEvents: {
    width: '100%',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  previewEventsTitle: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 8,
  },
  previewEvent: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 4,
  },
});
