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
  onPress?: () => void;
  onLongPress?: () => void;
  cellWidth: number;
}

export function CalendarCell({
  day,
  isToday,
  isSelected,
  isRangeStart,
  isRangeEnd,
  events = [],
  continuingEventIds = new Set(),
  onPress,
  onLongPress,
  cellWidth,
}: CalendarCellProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
  if (day === null) {
      // Empty cell
      return (
          <View style={[styles.cell, { width: cellWidth, height: cellWidth * 1.3, borderColor: theme.grid, borderRightWidth: 1, borderBottomWidth: 1, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(128,128,128,0.05)' }]} testID="CalendarCell-Empty" />
      );
  }

  return (
    <TouchableOpacity
      testID={`CalendarCell-${day ? day : 'empty'}`}
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={onLongPress}
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
          
          {/* Event Dots */}
          <View style={styles.dotsRow} testID="CalendarCell-DotsRow">
             {events.slice(0, 4).map((event, index) => (
                <View 
                  key={index}
                  testID={`CalendarCell-Dot-${index}`}
                  style={[styles.dot, { backgroundColor: event.color }]}
                />
             ))}
          </View>
      </View>
      
      {/* Connector Ring */}
      {continuingEventIds.size > 0 && (
         <View style={[styles.connectorRingContainer]} testID="CalendarCell-ConnectorContainer">
            <View style={[styles.connectorRing, { borderColor: events.find(e => continuingEventIds.has(e.id))?.color, backgroundColor: theme.background }]} testID="CalendarCell-ConnectorRing" />
         </View>
      )}
      
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

    </TouchableOpacity>
  );
}

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
      marginBottom: 2,
      marginHorizontal: 0,
  },
  dot: {
      width: 12,
      height: 12,
      borderRadius: 3,
      marginRight: 2,
  },
  connectorRingContainer: {
      position: 'absolute',
      right: -5,
      top: 18,
      zIndex: 10,
  },
  connectorRing: {
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 2,
  }
});
