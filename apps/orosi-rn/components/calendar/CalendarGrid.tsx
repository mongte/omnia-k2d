import React, { useMemo, useRef, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Text, TouchableOpacity, ViewToken, Platform } from 'react-native';
import { useCalendarStore } from './model/useCalendarStore';
import { CalendarCell } from './CalendarCell';
import Colors from '@/constants/Colors';
import { getDaysInMonth, startOfMonth, endOfMonth, getDay, addMonths, isSameDay, isSameMonth, isAfter, isBefore } from 'date-fns';
import Animated, { useSharedValue } from 'react-native-reanimated';



const BASE_YEAR = 2000;
const TOTAL_MONTHS = 2400; // 200 years

// Pre-calculate heights for performancei
// Pre-calculate heights for performance
// SCREEN_WIDTH removed, passing as prop

interface MonthConfig {
  date: Date;
  offset: number;
  height: number;
  rows: number;
  startOffset: number; // Empty cells before 1st day
  daysInMonth: number;
}

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 50,
  minimumViewTime: 100, // Debounce slightly
};

export function CalendarGrid({ width }: { width: number }) {
  const flatListRef = useRef<FlatList>(null);
  const [layoutReady, setLayoutReady] = useState(false);
  const isProgrammaticScroll = useRef(false);
  const programmaticScrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const focusedDay = useCalendarStore(state => state.focusedDay);
  const setFocusedDay = useCalendarStore(state => state.setFocusedDay);
  const lastUpdateSource = useCalendarStore(state => state.lastUpdateSource);
  const isYearScrolling = useCalendarStore(state => state.isYearScrolling);
  const toggleDaySelection = useCalendarStore(state => state.toggleDaySelection);
  const selectedRange = useCalendarStore(state => state.selectedRange);

  // Keep focusedDay in a ref for onViewableItemsChanged to avoid stale closures
  const focusedDayRef = useRef(focusedDay);
  useEffect(() => {
    focusedDayRef.current = focusedDay;
  }, [focusedDay]);

  const CELL_WIDTH = width / 7;
  const CELL_HEIGHT = CELL_WIDTH * 1.3;

  // Generate Month Configs
  const monthConfigs = useMemo<MonthConfig[]>(() => {
    const configs: MonthConfig[] = [];
    let accumulatedOffset = 0;

    for (let i = 0; i < TOTAL_MONTHS; i++) {
       const year = BASE_YEAR + Math.floor(i / 12);
       const month = i % 12; // 0-11
       const date = new Date(year, month, 1);
       
       const days = getDaysInMonth(date);
       const firstDay = startOfMonth(date);
       const emptyCells = getDay(firstDay); // 0 (Sun) - 6 (Sat)
       
       const totalCellsUsed = emptyCells + days;
       const rows = Math.ceil(totalCellsUsed / 7);
       
       // Spacing logic from Flutter:
       // "If the month ends on a Saturday... add a GAP ROW"
       const lastDay = endOfMonth(date);
       const isLastDaySaturday = getDay(lastDay) === 6;
       
       const effectiveRows = rows + (isLastDaySaturday ? 1 : 0);
       const height = effectiveRows * CELL_HEIGHT;
       
       configs.push({
         date,
         offset: accumulatedOffset,
         height,
         rows: effectiveRows,
         startOffset: emptyCells,
         daysInMonth: days,
       });
       
       accumulatedOffset += height;
    }
    return configs;
  }, [width]); // Re-calculate on width change

  // Sync scroll to focusedDay
  useEffect(() => {
    if (!layoutReady) return;
    
    // Only scroll if the update came from OUTSIDE (header/user), not from the grid itself.
    if (lastUpdateSource === 'grid') return;
    if (isYearScrolling) return; 
    
    // Calculate index of focused day
    const diffYears = focusedDay.getFullYear() - BASE_YEAR;
    const diffMonths = (diffYears * 12) + focusedDay.getMonth();
    
    const index = Math.max(0, Math.min(diffMonths, TOTAL_MONTHS - 1));
    const config = monthConfigs[index];
    
    // Flag start of programmatic scroll
    isProgrammaticScroll.current = true;
    if (programmaticScrollTimeout.current) clearTimeout(programmaticScrollTimeout.current);
    
    // Safety reset after 1s (in case scroll end doesn't fire or fails)
    programmaticScrollTimeout.current = setTimeout(() => {
        isProgrammaticScroll.current = false;
    }, 1000);

    flatListRef.current?.scrollToOffset({
       offset: config.offset,
       animated: true
    });
    
  }, [focusedDay, layoutReady, lastUpdateSource, isYearScrolling]); // Ensure all deps are listed

  // Viewability Config to update controller on scroll
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
     // Ignore updates during programmatic smoothing
     if (isProgrammaticScroll.current) return;

     if (viewableItems.length > 0) {
        const first = viewableItems[0];
        const index = first.index;
        if (index !== null) {
           const config = monthConfigs[index];
           if (config) {
               // Update focused day if month changed significantly
               // Use Ref to access current focusedDay
               if (!isSameMonth(config.date, focusedDayRef.current)) {
                   setFocusedDay(config.date, 'grid');
               }
           }
        }
     }
  }).current;

  // Render Month Item
  const renderItem = ({ item }: { item: MonthConfig }) => {
    return (
      <View style={{ height: item.height, width: width, flexDirection: 'row', flexWrap: 'wrap', overflow: 'hidden' }} testID="CalendarGrid-MonthItem">
        {/* We Render Grid of Cells */}
        {/* Empty Cells */}
        {Array.from({ length: item.startOffset }).map((_, i) => (
           <CalendarCell key={`empty-${i}`} day={null} date={item.date} cellWidth={CELL_WIDTH} />
        ))}
        
        {/* Days */}
        {Array.from({ length: item.daysInMonth }).map((_, i) => {
           const dayNum = i + 1;
           const date = new Date(item.date.getFullYear(), item.date.getMonth(), dayNum);
           
           // Mock Events (Hardcoded for demo parity with Flutter)
           const events = [];
           if (dayNum === 12) {
              events.push({ id: '1', title: 'Start', startTime: date, endTime: date, color: Colors.AppColors.eventOrange });
              events.push({ id: '2', title: '', startTime: date, endTime: date, color: 'green' });
           }
           if (dayNum === 13) events.push({ id: '1', title: 'Mid', startTime: date, endTime: date, color: Colors.AppColors.eventOrange });
           if (dayNum === 14) {
              events.push({ id: '1', title: 'End', startTime: date, endTime: date, color: Colors.AppColors.eventOrange });
              events.push({ id: '6', title: '', startTime: date, endTime: date, color: 'grey' });
           }
           
           // Continuing Events (Mock)
           const continuingIds = new Set<string>();
           if (dayNum === 12) continuingIds.add('1');
           if (dayNum === 13) continuingIds.add('1');

             // Check selection locally
             let isSelected = false;
             let isStart = false;
             let isEnd = false;
             
             if (selectedRange) {
                 const { start, end } = selectedRange;
                 isStart = isSameDay(date, start);
                 isEnd = isSameDay(date, end);
                 isSelected = (isAfter(date, start) || isStart) && (isBefore(date, end) || isEnd);
             }

           return (
             <CalendarCell 
               key={`day-${dayNum}`} 
               day={dayNum} 
               date={date}
               isToday={isSameDay(date, new Date())}
               isSelected={isSelected}
               isRangeStart={isStart}
               isRangeEnd={isEnd}
               events={events}
               continuingEventIds={continuingIds}
               onPress={() => toggleDaySelection(date)} 
               cellWidth={CELL_WIDTH}
             />
           );
        })}
        
        {/* Remaining empty space is handled by the container height constraint automatically? 
            FlexWrap wraps. We calculated height based on rows.
            The remaining space in the last row will be empty.
            But we need borders for them?
            Flutter renders 'null' cells for them if I recall correctly?
            Actually "if (dayNum < 1 || dayNum > daysInMonth) return null cell".
            But we loop only valid days.
            We should fill the rest of the grid if we want borders.
            The `effectiveRows * 7` is the total cells.
        */}
        {Array.from({ length: (Math.ceil((item.startOffset + item.daysInMonth) / 7) * 7) - (item.startOffset + item.daysInMonth) }).map((_, i) => (
             <CalendarCell key={`trail-${i}`} day={null} date={item.date} cellWidth={CELL_WIDTH} />
        ))}
        {/* Special Case: Gap Row (7 cells) */}
        {(item.rows * 7 > (Math.ceil((item.startOffset + item.daysInMonth) / 7) * 7)) && (
             Array.from({ length: 7 }).map((_, i) => (
                <CalendarCell key={`gap-${i}`} day={null} date={item.date} cellWidth={CELL_WIDTH} />
             ))
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }} testID="CalendarGrid">
      {/* Weekday Header */}
      <View style={styles.weekdayHeader} testID="CalendarGrid-WeekHeader">
        {WEEKDAYS.map(day => (
          <View key={day} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} testID={`CalendarGrid-WeekdayItem-${day}`}>
             <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>
      
      {/* Grid */}
      <FlatList
        ref={flatListRef}
        data={monthConfigs}
        renderItem={renderItem}
        keyExtractor={(item) => item.date.toISOString()}
        getItemLayout={(data, index) => ({
           length: monthConfigs[index].height,
           offset: monthConfigs[index].offset,
           index,
        })}
        onLayout={() => setLayoutReady(true)}
        initialNumToRender={2}
        windowSize={3}
        maxToRenderPerBatch={2}
        removeClippedSubviews={true}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
        onScrollBeginDrag={() => {
             // User started interacting, cancel programmatic lock immediately
             isProgrammaticScroll.current = false;
             if (programmaticScrollTimeout.current) clearTimeout(programmaticScrollTimeout.current);
        }}
        onMomentumScrollEnd={() => {
             // Scroll finished
             isProgrammaticScroll.current = false;
             if (programmaticScrollTimeout.current) clearTimeout(programmaticScrollTimeout.current);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  weekdayHeader: {
    height: 40,
    flexDirection: 'row',
    backgroundColor: '#fff', 
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
      android: { elevation: 2 },
    }),
    zIndex: 1,
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.4,
  }
});


