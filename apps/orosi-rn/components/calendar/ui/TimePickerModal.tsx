import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, Dimensions, TextInput } from 'react-native';
import { GradientSelector } from './GradientSelector';
import Colors from '@/constants/Colors';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onTimeSelect: (hours: number, minutes: number) => void;
  initialTime?: Date;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES_STEP = 5;
const MINUTES = Array.from({ length: 60 / MINUTES_STEP }, (_, i) => i * MINUTES_STEP);

export function TimePickerModal({ visible, onClose, onTimeSelect, initialTime }: TimePickerModalProps) {
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [manualMinute, setManualMinute] = useState('');
  const [isEditingMinute, setIsEditingMinute] = useState(false);

  const { width } = Dimensions.get('window');
  const contentWidth = width - 48;

  useEffect(() => {
    if (visible && initialTime) {
      setSelectedHour(initialTime.getHours());
      setSelectedMinute(initialTime.getMinutes());
      setManualMinute(initialTime.getMinutes().toString().padStart(2, '0'));
    }
  }, [visible, initialTime]);

  const handleManualMinuteChange = (text: string) => {
    // Only allow numbers
    const cleaned = text.replace(/[^0-9]/g, '');
    
    // Limit to 2 digits
    if (cleaned.length > 2) return;
    
    setManualMinute(cleaned);
    
    const val = parseInt(cleaned, 10);
    if (!isNaN(val) && val >= 0 && val < 60) {
        setSelectedMinute(val);
    }
  };

  const handleConfirm = () => {
    onTimeSelect(selectedHour, selectedMinute);
    onClose();
  };

  // Find the closest index for the selector
  // If selectedMinute is 13, closest 5-min step is 10 (index 2) or 15 (index 3)?
  // User wants "5 minute steps" for selector.
  // We can just round to nearest or floor. Let's floor to match list?
  // Actually, if I manually type 13, the selector should probably visually snap to nearest (10 or 15)
  // or just stay at the closest one.
  const hourIndex = HOURS.indexOf(selectedHour);
  // Find closest minute in our MINUTES array
  const minuteIndex = useMemo(() => {
      let closest = 0;
      let minDiff = 60;
      MINUTES.forEach((m, i) => {
          const diff = Math.abs(m - selectedMinute);
          if (diff < minDiff) {
              minDiff = diff;
              closest = i;
          }
      });
      return closest;
  }, [selectedMinute]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
          <View style={styles.content}>
              <View style={styles.header}>
                  <Text style={styles.title}>시간 설정</Text>
                  
                  {/* Time Display with Editable Minute */}
                  <View style={styles.timeDisplay}>
                      <Text style={styles.timeText}>
                          {selectedHour.toString().padStart(2, '0')}
                      </Text>
                      <Text style={styles.colon}>:</Text>
                      <TextInput
                          style={styles.minuteInput}
                          value={isEditingMinute ? manualMinute : selectedMinute.toString().padStart(2, '0')}
                          onChangeText={handleManualMinuteChange}
                          keyboardType="number-pad"
                          onFocus={() => {
                              setIsEditingMinute(true);
                              setManualMinute(selectedMinute.toString().padStart(2, '0'));
                          }}
                          onBlur={() => setIsEditingMinute(false)}
                          maxLength={2}
                          selectTextOnFocus
                      />
                  </View>
              </View>

              <View style={styles.selectorsResult}>
                  {/* Hour Selector */}
                  <View style={styles.selectorColumn}>
                      <Text style={styles.columnLabel}>시</Text>
                      <GradientSelector
                          data={HOURS}
                          itemWidth={60}
                          height={200}
                          containerWidth={60}
                          initialIndex={hourIndex}
                          selectedIndex={hourIndex}
                          onIndexChanged={(index) => {
                             const h = HOURS[index];
                             setSelectedHour(h);
                          }}
                          orientation="vertical"
                          itemHeight={40}
                          renderItem={(item) => (
                              <Text style={styles.itemText}>{item.toString().padStart(2, '0')}</Text>
                          )}
                      />
                  </View>

                  {/* Minute Selector */}
                  <View style={styles.selectorColumn}>
                       <Text style={styles.columnLabel}>분</Text>
                       <GradientSelector
                          data={MINUTES}
                          itemWidth={60}
                          height={200}
                          containerWidth={60}
                          initialIndex={minuteIndex}
                          selectedIndex={minuteIndex}
                          onIndexChanged={(index) => {
                              const m = MINUTES[index];
                              setSelectedMinute(m);
                              setManualMinute(m.toString().padStart(2, '0'));
                          }}
                          orientation="vertical"
                          itemHeight={40}
                          renderItem={(item) => (
                              <Text style={styles.itemText}>{item.toString().padStart(2, '0')}</Text>
                          )}
                      />
                  </View>
              </View>

              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                  <Text style={styles.confirmText}>완료</Text>
              </TouchableOpacity>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '85%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
      fontSize: 16,
      fontWeight: '600',
      color: '#64748b',
      marginBottom: 12,
  },
  timeDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
  },
  timeText: {
      fontSize: 40,
      fontWeight: '700',
      color: '#0f172a',
      fontVariant: ['tabular-nums'],
  },
  colon: {
      fontSize: 40,
      fontWeight: '700',
      color: '#0f172a',
      marginHorizontal: 4,
      marginTop: -4,
  },
  minuteInput: {
      fontSize: 40,
      fontWeight: '700',
      color: Colors.AppColors.primary,
      fontVariant: ['tabular-nums'],
      minWidth: 60,
      textAlign: 'center',
      padding: 0,
  },
  selectorsResult: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 16,
      marginBottom: 24,
  },
  selectorColumn: {
      alignItems: 'center',
      gap: 8,
  },
  columnLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: '#94a3b8',
  },
  itemText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#334155',
  },
  confirmButton: {
      backgroundColor: Colors.AppColors.primary,
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 12,
      width: '100%',
      alignItems: 'center',
  },
  confirmText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
  }
});
