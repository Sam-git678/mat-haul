import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


interface PinModalProps {
  visible: boolean;       
  onClose: () => void;     
  onConfirm: (pin: string) => void;   
}

export default function PinModal({ visible, onClose, onConfirm }: PinModalProps) {
  const [pin, setPin] = useState('');

  // Automatically trigger confirmation when 4 digits are reached
  useEffect(() => {
    if (pin.length === 4) {
      onConfirm(pin);
      setPin(''); // Reset for next time
    }
  }, [pin]);

  const handlePress = (val: string) => {
    if (pin.length < 4) setPin(prev => prev + val);
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    if (!visible) setPin('');
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.pullBar} />
          <Text style={styles.title}>Confirm With PIN</Text>
          <Text style={styles.subtitle}>Enter your 4-digit transaction PIN</Text>

          {/* PIN Dots Display */}
          <View style={styles.dotsContainer}>
            {[1, 2, 3, 4].map((_, i) => (
              <View 
                key={i} 
                style={[styles.dot, pin.length > i && styles.dotActive]} 
              />
            ))}
          </View>

          {/* Numeric Keypad */}
          <View style={styles.keypad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'].map((key, i) => (
              <TouchableOpacity 
                key={i} 
                style={[styles.key, key === '' && styles.keyEmpty]} 
                onPress={() => key === 'back' ? handleDelete() : key !== '' && handlePress(key)}
                activeOpacity={0.75}
                disabled={key === ''}
              >
                {key === 'back' ? (
                  <Ionicons name="backspace-outline" size={22} color="#334155" />
                ) : (
                  <Text style={styles.keyText}>{key}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          <Pressable onPress={onClose} style={styles.closeArea}>
             <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 22,
    alignItems: 'center',
  },
  pullBar: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 26,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 10,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  dotActive: {
    backgroundColor: '#0B4A8B',
    borderColor: '#0B4A8B',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    rowGap: 8,
  },
  key: {
    width: '33%',
    height: 62,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  keyEmpty: {
    opacity: 0,
  },
  keyText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#0F172A',
  },
  closeArea: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
  },
  cancelText: {
    color: '#475467',
    fontWeight: '700',
    fontSize: 14,
  }
});
