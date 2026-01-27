import { format, isSameMonth } from 'date-fns';
import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CalendarGrid } from '../CalendarGrid';
import { GradientSelector } from './GradientSelector';

const BASE_YEAR = 2000;
const TOTAL_YEARS = 200;
const TOTAL_MONTHS = 2400;

interface MiniCalendarModalProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  initialDate?: Date;
}

export function MiniCalendarModal({
  visible,
  onClose,
  onDateSelect,
  initialDate,
}: MiniCalendarModalProps) {
  // Local focused day for the mini calendar (scrolling)
  const [focusedDay, setFocusedDay] = useState(initialDate || new Date());
  // Selected date state (independent of scrolling)
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());

  const { width } = Dimensions.get('window');
  // Use a smaller width for the modal content (e.g., 70% of screen)
  const contentWidth = width * 0.7;
  const contentHeight = contentWidth; // Square ratio

  // Update local states when modal becomes visible or initialDate changes
  React.useEffect(() => {
    if (visible && initialDate) {
      setFocusedDay(initialDate);
      setSelectedDate(initialDate);
    }
  }, [visible, initialDate]);

  // Data for Selectors
  const yearData = React.useMemo(
    () => Array.from({ length: TOTAL_YEARS }, (_, i) => BASE_YEAR + i),
    [],
  );
  const monthData = React.useMemo(
    () =>
      Array.from({ length: TOTAL_MONTHS }, (_, i) => {
        const year = BASE_YEAR + Math.floor(i / 12);
        const month = i % 12;
        return new Date(year, month, 1);
      }),
    [],
  );

  const initialYearIndex = Math.max(0, focusedDay.getFullYear() - BASE_YEAR);
  const diffYears = focusedDay.getFullYear() - BASE_YEAR;
  const diffMonths = diffYears * 12 + focusedDay.getMonth();
  const initialMonthIndex = Math.max(0, Math.min(diffMonths, TOTAL_MONTHS - 1));

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
          <TouchableOpacity
            style={styles.backdrop}
            onPress={onClose}
            activeOpacity={1}
          />
          <View style={styles.content}>
            {/* Header with Selectors */}
            <View style={styles.header}>
              <View style={styles.selectorsResult}>
                {/* Year Selector */}
                <GradientSelector
                  data={yearData}
                  itemWidth={80}
                  height={40}
                  containerWidth={contentWidth * 0.5}
                  initialIndex={initialYearIndex}
                  selectedIndex={initialYearIndex}
                  onIndexChanged={(index) => {
                    const year = yearData[index];
                    if (year !== focusedDay.getFullYear()) {
                      setFocusedDay(
                        new Date(
                          year,
                          focusedDay.getMonth(),
                          focusedDay.getDate(),
                        ),
                      );
                    }
                  }}
                  renderItem={(item) => (
                    <Text style={styles.yearText}>{item}</Text>
                  )}
                />

                {/* Month Selector */}
                <GradientSelector
                  data={monthData}
                  itemWidth={60}
                  height={30}
                  containerWidth={contentWidth * 0.4}
                  initialIndex={initialMonthIndex}
                  selectedIndex={initialMonthIndex}
                  onIndexChanged={(index) => {
                    const date = monthData[index];
                    if (!isSameMonth(date, focusedDay)) {
                      setFocusedDay(date);
                    }
                  }}
                  renderItem={(item) => (
                    <Text style={styles.monthText}>
                      {format(item, 'MMM').toUpperCase()}
                    </Text>
                  )}
                />
              </View>
            </View>

            <View style={{ height: contentHeight, width: contentWidth }}>
              <CalendarGrid
                width={contentWidth}
                focusedDay={focusedDay}
                onPressDay={(date) => {
                  setSelectedDate(date);
                  onDateSelect(date);
                  onClose();
                }}
                onFocusedDayChange={setFocusedDay}
                selectedRange={{ start: selectedDate, end: selectedDate }}
                showEvents={false}
              />
            </View>
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
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    paddingBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  selectorsResult: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  yearText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  monthText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
});
