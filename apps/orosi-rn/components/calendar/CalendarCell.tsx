import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { CalendarEvent } from './model/calendarTypes';
import Colors from '@/constants/Colors';
import { isSameDay, getDay } from 'date-fns';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  interpolate,
} from 'react-native-reanimated';

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
  isFocused?: boolean;
  isLastColumn?: boolean;
  showBottomBorder?: boolean;
}

// Memoized to prevent re-renders on every scroll/drag update
export const CalendarCell = React.memo(
  ({
    day,
    date,
    isToday,
    isSelected,
    isRangeStart,
    isRangeEnd,
    events = [],
    continuingEventIds = new Set(),
    onLongPress,
    cellWidth,
    isFocused = false,
    isLastColumn = false,
    showBottomBorder = true,
  }: CalendarCellProps) => {
    // const colorScheme = useColorScheme();
    const theme = Colors.light;

    const focusDerived = useSharedValue(isFocused ? 1 : 0);

    useEffect(() => {
        focusDerived.value = withTiming(isFocused ? 1 : 0, { duration: 150 });
    }, [isFocused]);

    const rContainerStyle = useAnimatedStyle(() => {
        const borderColor = interpolateColor(
            focusDerived.value,
            [0, 1],
            [theme.grid, '#E0E0E0']
        );
        return { borderColor };
    });

    const rTextStyle = useAnimatedStyle(() => {
        const opacity = interpolate(focusDerived.value, [0, 1], [0.2, 0.9]);
        return { opacity };
    });

    const rDotsStyle = useAnimatedStyle(() => {
        const opacity = interpolate(focusDerived.value, [0, 1], [0.3, 1]);
        return { opacity };
    });

    if (day === null) {
      // Empty cell
      return (
        <View
          style={[
            styles.cell,
            {
              width: cellWidth,
              height: cellWidth * 1.3,
              borderColor: theme.grid,
              borderRightWidth: isLastColumn ? 0 : 1,
              borderBottomWidth: showBottomBorder ? 1 : 0,
              backgroundColor: theme.tableCellEmpty,
            },
          ]}
          testID="CalendarCell-Empty"
        />
      );
    }

    return (
      <Animated.View
        testID={`CalendarCell-${day ? day : 'empty'}`}
        style={[
          styles.cell,
          rContainerStyle,
          {
            width: cellWidth,
            height: cellWidth * 1.3,
            borderRightWidth: isLastColumn ? 0 : 1,
            borderBottomWidth: showBottomBorder ? 1 : 0,
            backgroundColor: theme.background,
          },
        ]}
      >
        <View style={{ flex: 1, padding: 8 }} testID="CalendarCell-Content">
          {/* Day Number */}
          {isToday ? (
            <View style={styles.todayCircle} testID="CalendarCell-TodayCircle">
              <Text style={styles.todayText}>{day}</Text>
            </View>
          ) : (
            <Animated.Text 
              style={[
                styles.dayText, 
                rTextStyle,
                { 
                  color: theme.text, 
                }
              ]}
            >
              {day}
            </Animated.Text>
          )}

          <View style={{ flex: 1 }} testID="CalendarCell-Space" />

          {/* Event Dots / Squares */}
          <Animated.View 
            style={[
              styles.dotsRow, 
              rDotsStyle
            ]} 
            testID="CalendarCell-DotsRow"
          >
            {events.slice(0, 10).map(
              (
                event,
                index
              ) => (
                <View
                  key={index}
                  testID={`CalendarCell-Dot-${index}`}
                  style={[styles.dot, { backgroundColor: event.color }]}
                />
              )
            )}
          </Animated.View>
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
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                borderTopWidth: 2,
                borderBottomWidth: 2,
                borderLeftWidth: isRangeStart || getDay(date) === 0 ? 2 : 0,
                borderRightWidth: isRangeEnd || getDay(date) === 6 ? 2 : 0,
                borderColor: Colors.AppColors.primary,
                borderTopLeftRadius: isRangeStart || getDay(date) === 0 ? 6 : 0,
                borderBottomLeftRadius:
                  isRangeStart || getDay(date) === 0 ? 6 : 0,
                borderTopRightRadius: isRangeEnd || getDay(date) === 6 ? 6 : 0,
                borderBottomRightRadius:
                  isRangeEnd || getDay(date) === 6 ? 6 : 0,
                backgroundColor: 'rgba(0, 214, 86, 0.05)',
              },
            ]}
            pointerEvents="none"
            testID="CalendarCell-SelectionOverlay"
          />
        )}
      </Animated.View>
    );
  },
  (prev, next) => {
    // Custom comparison to handle Date object references being different
    const isDateEqual = prev.date.getTime() === next.date.getTime();
    const isEventsEqual = prev.events === next.events;
    const isIdsEqual = prev.continuingEventIds === next.continuingEventIds;
    // Add isFocused check
    const isFocusedEqual = prev.isFocused === next.isFocused;
    const isBorderPropsEqual = prev.isLastColumn === next.isLastColumn && prev.showBottomBorder === next.showBottomBorder;

    return (
      prev.day === next.day &&
      prev.isSelected === next.isSelected &&
      prev.isToday === next.isToday &&
      prev.isRangeStart === next.isRangeStart &&
      prev.isRangeEnd === next.isRangeEnd &&
      prev.cellWidth === next.cellWidth &&
      isDateEqual &&
      isEventsEqual &&
      isIdsEqual &&
      isFocusedEqual &&
      isBorderPropsEqual
    );
  }
);

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
    marginTop: 2, // Slight adjustment
  },
  todayText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 13,
  },
  dayText: {
    fontWeight: '600',
    marginTop: 6,
    fontSize: 13,
  },
  dotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap-reverse', // Wraps from bottom-left up
    alignContent: 'flex-start', // Lines pack to the start (bottom in wrap-reverse context)
    width: '100%',
    marginBottom: 4, // Space from bottom
    paddingHorizontal: 4,
    gap: 3, // Horizontal gap
    rowGap: 3, // Vertical gap
  },
  dot: {
    width: 10, // Larger for square look
    height: 10,
    borderRadius: 3, // Rounded square
  },
});
