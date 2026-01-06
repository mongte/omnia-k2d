import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Dimensions } from 'react-native';
import { CalendarEvent } from './model/calendarTypes';
import Colors from '@/constants/Colors';
import { isSameDay } from 'date-fns';

interface CalendarCellProps {
  day: number | null;
  date: Date; // The full date, even if day is null (for context if needed) but mostly for selection check
  isToday?: boolean;
  isSelected?: boolean;
  isRangeStart?: boolean;
  isRangeEnd?: boolean;
  events?: CalendarEvent[];
  continuingEventIds?: Set<string>;
  onLongPress?: () => void;
  cellWidth: number;
}

// Memoized to prevent re-renders on every scroll/drag update
export const CalendarCell = React.memo(({
  day,
  isToday,
  isSelected,
  isRangeStart,
  isRangeEnd,
  events = [],
  continuingEventIds = new Set(),
  onLongPress,
  cellWidth,
}: CalendarCellProps) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
  if (day === null) {
      // Empty cell
      return (
          <View style={[styles.cell, { width: cellWidth, height: cellWidth * 1.3, borderColor: theme.grid, borderRightWidth: 1, borderBottomWidth: 1, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(128,128,128,0.05)' }]} testID="CalendarCell-Empty" />
      );
  }

  return (
    <View
      testID={`CalendarCell-${day ? day : 'empty'}`}
      style={[
        styles.cell,
        {
          width: cellWidth,
          height: cellWidth * 1.3,
          borderColor: theme.grid,
          borderRightWidth: 1,
          borderBottomWidth: 1,
          backgroundColor: theme.background
        }
      ]}
    >
      <View style={{ flex: 1, padding: 8 }} testID="CalendarCell-Content">
          {/* Day Number */}
          {isToday ? (
             <View style={styles.todayCircle} testID="CalendarCell-TodayCircle">
               <Text style={styles.todayText}>{day}</Text>
             </View>
          ) : (
             <Text style={[styles.dayText, { color: theme.text, opacity: 0.7 }]}>{day}</Text>
          )}

          <View style={{ flex: 1 }} testID="CalendarCell-Space" />
          
          {/* Event Dots / Squares */}
          <View style={styles.dotsRow} testID="CalendarCell-DotsRow">
             {events.slice(0, 10).map((event, index) => ( // Increased limit to show stacking
                <View 
                  key={index}
                  testID={`CalendarCell-Dot-${index}`}
                  style={[styles.dot, { backgroundColor: event.color }]}
                />
             ))}
          </View>
      </View>
      

      
      {/* Selection Overlay (if drawn on top or integrated?)
          In Flutter it was a CustomPainter. In RN, we can use absolute overlay.
          However, grid selection is continuous. Handling it per cell is easier if it's rectangular.
          Flutter code drew a path. Here we can use simple conditional styles if selection is simple.
          For now, ignoring complex selection painting overlay, assume it's handled by parent or simple highlight.
          Wait, user wants parity. Flutter drew selection boxes.
          We can render a background color if selected.
      */}
      {isSelected && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.AppColors.primary, opacity: 0.1 }]} pointerEvents="none" testID="CalendarCell-SelectionOverlay" />
      )}
       {/* Range Borders - Simplified for MVP, Flutter one drew lines manually */}
      {isSelected && (
          <View style={[StyleSheet.absoluteFill, { borderWidth: 2, borderColor: Colors.AppColors.primary }]} pointerEvents="none" testID="CalendarCell-BorderOverlay" />
      )}

    </View>
  );
}, (prev, next) => {
  // Custom comparison to handle Date object references being different
  const isDateEqual = prev.date.getTime() === next.date.getTime();
  const isEventsEqual = prev.events === next.events;
  const isIdsEqual = prev.continuingEventIds === next.continuingEventIds;
  
  return (
    prev.day === next.day &&
    prev.isSelected === next.isSelected &&
    prev.isToday === next.isToday &&
    prev.isRangeStart === next.isRangeStart &&
    prev.isRangeEnd === next.isRangeEnd &&
    prev.cellWidth === next.cellWidth &&
    isDateEqual &&
    isEventsEqual &&
    isIdsEqual
  );
});

const styles = StyleSheet.create({
  cell: {
    // border moved to inline styles for theme
  },
  todayCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: Colors.AppColors.primary,
      alignItems: 'center',
      justifyContent: 'center',
  },
  todayText: {
      color: '#000',
      fontWeight: 'bold',
  },
  dayText: {
      fontWeight: '500',
  },
  dotsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap-reverse', // Wraps from bottom-left up
      alignContent: 'flex-start', // Lines pack to the start (bottom in wrap-reverse context)
      width: '100%',
      // Ensure specific height or just fill? 
      // Flex 1 in parent helps.
      marginTop: 2, 
  },
  dot: {
      width: 8,
      height: 8,
      borderRadius: 1, // Square with slight radius
      marginRight: 2,
      marginTop: 2, // Space between rows (visually above because of wrap-reverse?)
      // Actually with wrap-reverse, 'marginTop' adds space *above* the item in the line.
      // Lines stack bottom-to-top.
  },

});
