import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { useCalendarStore } from './model/useCalendarStore';
import { GradientSelector } from './ui/GradientSelector';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { addMonths, addYears, format, isSameMonth } from 'date-fns';
import { UpdateSource } from './model/calendarTypes';

interface CalendarHeaderProps {
  onOpenDrawer: () => void;
  width?: number;
}

const BASE_YEAR = 2000;
const TOTAL_YEARS = 200;
const TOTAL_MONTHS = 2400;

export function CalendarHeader({ onOpenDrawer, width = 350 }: CalendarHeaderProps) {
  // width defaulting to 350 or screen width if not provided
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? Colors.dark : Colors.light;

  const focusedDay = useCalendarStore(state => state.focusedDay);
  const setFocusedDay = useCalendarStore(state => state.setFocusedDay);
  // const jumpToMonth = useCalendarStore(state => state.jumpToMonth); // Unused
  const setYearScrolling = useCalendarStore(state => state.setYearScrolling);

  // Generate Year Data (Ascending: 2000 -> 2199)
  const yearData = useMemo(() => {
    return Array.from({ length: TOTAL_YEARS }, (_, i) => BASE_YEAR + i);
  }, []);
  
  // Initial Year Index
  const initialYearIndex = Math.max(0, focusedDay.getFullYear() - BASE_YEAR);
  
  // Month Data (Ascending: Jan 2000 -> ...)
  const monthData = useMemo<Date[]>(() => {
     return Array.from({ length: TOTAL_MONTHS }, (_, i) => {
        const year = BASE_YEAR + Math.floor(i / 12);
        const month = i % 12;
        return new Date(year, month, 1);
     });
  }, []);
  
  // Initial Month Index
  const diffYears = focusedDay.getFullYear() - BASE_YEAR;
  const diffMonths = (diffYears * 12) + focusedDay.getMonth();
  const initialMonthIndex = Math.max(0, Math.min(diffMonths, TOTAL_MONTHS - 1));

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background, shadowColor: '#000' }]} testID="CalendarHeader">
      {/* Top Row: Menu */}
      <View style={styles.topRow} testID="CalendarHeader-TopRow">
        <TouchableOpacity onPress={onOpenDrawer} hitSlop={10}>
          <Ionicons name="menu" size={24} color={themeColors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.controlsContainer} testID="CalendarHeader-Controls">
          <View style={styles.selectorsContainer} testID="CalendarHeader-Selectors">
            {/* Year Selector */}
            <GradientSelector 
               data={yearData}
               itemWidth={87.5}
               height={44}
               containerWidth={width ? width * 0.6 : undefined}
               initialIndex={initialYearIndex}
               selectedIndex={initialYearIndex}
               onIndexChanged={(index) => {
                  // While dragging we might want to update focusedDay to show preview?
                  // User asked: "Minimize rendering... when year selected then render"
                  // So we DO NOT call setFocusedDay here if we want to defer.
                  // But GradientSelector calls this on momentum end.
                  // We should check if we are scrolling?
                  // `onIndexChanged` in GradientSelector is called onMomentumEnd.
                  // So it is safe to update here.
                  
                  const year = yearData[index];
                  const current = focusedDay;
                  // Only update if changed
                  if (year !== current.getFullYear()) {
                      // Update focused day with 'header' source to sync grid
                      setFocusedDay(new Date(year, current.getMonth(), current.getDate()), 'header'); 
                  }
               }}
               onScrollStart={() => setYearScrolling(true)}
               onScrollEnd={() => setYearScrolling(false)}
               renderItem={(item, _, scrollX) => {
                 // item is year number
                 return (
                   <Text style={[styles.yearText, { color: themeColors.text }]}>
                     {item}
                   </Text>
                 );
               }}
            />
            
            <View style={{ height: 12 }} testID="CalendarHeader-Spacer" />
            
            {/* Month Selector */}
            <GradientSelector 
               data={monthData}
               itemWidth={62.5}
               height={30}
               containerWidth={width ? width * 0.6 : undefined}
               initialIndex={initialMonthIndex}
               selectedIndex={initialMonthIndex}
               onIndexChanged={(index) => {
                  // Month selection
                  const date = monthData[index];
                  if (!isSameMonth(date, focusedDay)) {
                      setFocusedDay(date, 'header');
                  }
               }}
               renderItem={(item, _, __) => {
                 // item is Date
                 return (
                   <Text style={[styles.monthText, { color: themeColors.text }]}>
                     {format(item, 'MMM').toUpperCase()}
                   </Text>
                 );
               }}
            />
          </View>
         
         {/* Right Actions */}
         <View style={styles.rightActions} testID="CalendarHeader-RightActions">
             <TouchableOpacity style={styles.todayButton} onPress={() => setFocusedDay(new Date())}>
                <Ionicons name="calendar" size={18} color={Colors.AppColors.primary} />
             </TouchableOpacity>
         </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  topRow: {
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  controlsContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  selectorsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  rightActions: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearText: {
    fontSize: 28,
    fontWeight: '900',
  },
  monthText: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1.0,
  }
});
