import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { CalendarController } from './types';
import { GradientSelector } from './ui/GradientSelector';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';
import { addMonths, addYears, format, isSameMonth } from 'date-fns';
import { UpdateSource } from './types';

interface CalendarHeaderProps {
  controller: CalendarController;
  onOpenDrawer: () => void;
  width?: number;
}

const BASE_YEAR = 2000;
const TOTAL_YEARS = 200;
const TOTAL_MONTHS = 2400;

export function CalendarHeader({ controller, onOpenDrawer, width = 350 }: CalendarHeaderProps) {
  // width defaulting to 350 or screen width if not provided
  console.log('??????')
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? Colors.dark : Colors.light;

  // Generate Year Data (Ascending: 2000 -> 2199)
  const yearData = useMemo(() => {
    return Array.from({ length: TOTAL_YEARS }, (_, i) => BASE_YEAR + i);
  }, []);
  
  // Initial Year Index
  const initialYearIndex = Math.max(0, controller.focusedDay.getFullYear() - BASE_YEAR);
  
  // Month Data (Ascending: Jan 2000 -> ...)
  const monthData = useMemo<Date[]>(() => {
     return Array.from({ length: TOTAL_MONTHS }, (_, i) => {
        const year = BASE_YEAR + Math.floor(i / 12);
        const month = i % 12;
        return new Date(year, month, 1);
     });
  }, []);
  
  // Initial Month Index
  const diffYears = controller.focusedDay.getFullYear() - BASE_YEAR;
  const diffMonths = (diffYears * 12) + controller.focusedDay.getMonth();
  const initialMonthIndex = Math.max(0, Math.min(diffMonths, TOTAL_MONTHS - 1));

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background, shadowColor: '#000' }]}>
      {/* Top Row: Menu */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={onOpenDrawer} hitSlop={10}>
          <Ionicons name="menu" size={24} color={themeColors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.controlsContainer}>
          <View style={styles.selectorsContainer}>
            {/* Year Selector */}
            <GradientSelector 
               data={yearData}
               itemWidth={87.5}
               height={44}
               containerWidth={width}
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
                  const current = controller.focusedDay;
                  // Only update if changed
                  if (year !== current.getFullYear()) {
                      controller.jumpToMonth(new Date(year, current.getMonth(), current.getDate()));
                      // jumpToMonth sets source to 'user' (or we should set to 'header')?
                      // The controller uses 'user' by default. Let's explicit in jumpToMonth or setFocusedDay directly.
                      controller.setFocusedDay(new Date(year, current.getMonth(), current.getDate()), 'header'); 
                  }
               }}
               onScrollStart={() => controller.setYearScrolling(true)}
               onScrollEnd={() => controller.setYearScrolling(false)}
               renderItem={(item, _, scrollX) => {
                 // item is year number
                 return (
                   <Text style={[styles.yearText, { color: themeColors.text }]}>
                     {item}
                   </Text>
                 );
               }}
            />
            
            <View style={{ height: 4 }} />
            
            {/* Month Selector */}
            <GradientSelector 
               data={monthData}
               itemWidth={62.5}
               height={30}
               containerWidth={width}
               initialIndex={initialMonthIndex}
               selectedIndex={initialMonthIndex}
               onIndexChanged={(index) => {
                  // Month selection
                  const date = monthData[index];
                  if (!isSameMonth(date, controller.focusedDay)) {
                      controller.setFocusedDay(date, 'header');
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
         <View style={styles.rightActions}>
             <TouchableOpacity style={styles.todayButton} onPress={() => controller.setFocusedDay(new Date())}>
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
