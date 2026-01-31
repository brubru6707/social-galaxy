import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type EventQuestionModalProps = {
  visible: boolean;
  question: string;
  leftOption: string;
  rightOption: string;
  onSelect: (answer: 'left' | 'right') => void;
  onClose?: () => void;
};

export default function EventQuestionModal({
  visible,
  question,
  leftOption,
  rightOption,
  onSelect,
  onClose,
}: EventQuestionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalQuestion}>{question}</Text>
          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={[styles.modalOptionButton, { backgroundColor: '#FF5CB3' }]}
              onPress={() => onSelect('left')}
            >
              <Text style={styles.modalOptionText}>{leftOption}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalOptionButton, { backgroundColor: '#7C5CFF' }]}
              onPress={() => onSelect('right')}
            >
              <Text style={styles.modalOptionText}>{rightOption}</Text>
            </TouchableOpacity>
          </View>
          {onClose && (
            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <Text style={styles.modalCloseText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#000',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
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
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  modalOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 8,
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    opacity: 0.7,
    lineHeight: 22,
  },
});
