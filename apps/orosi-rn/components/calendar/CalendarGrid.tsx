import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  ViewToken,
  Platform,
} from 'react-native';
import { useCalendarStore } from './model/useCalendarStore';
import Colors from '@/constants/Colors';
import {
  getDaysInMonth,
  startOfMonth,
  endOfMonth,
  getDay,
  isSameMonth,
} from 'date-fns';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { MonthConfig } from './model/calendarTypes';
import { MonthItem } from './ui/MonthItem';

const BASE_YEAR = 2000;
const TOTAL_MONTHS = 2400; // 200 years

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 50,
  minimumViewTime: 100, // Debounce slightly
};

interface CalendarGridProps {
  width: number;
  focusedDay?: Date;
  onPressDay?: (date: Date) => void;
  onFocusedDayChange?: (date: Date) => void;
  selectedRange?: { start: Date; end: Date } | null;
  showEvents?: boolean;
}

export function CalendarGrid({
  width,
  focusedDay: propFocusedDay,
  onPressDay,
  onFocusedDayChange,
  selectedRange: propSelectedRange,
  showEvents = true,
}: CalendarGridProps) {
  const flatListRef = useRef<FlatList>(null);
  const [layoutReady, setLayoutReady] = useState(false);
  const containerHeight = useRef(0);
  const isProgrammaticScroll = useRef(false);
  const programmaticScrollTimeout = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const storeFocusedDay = useCalendarStore((state) => state.focusedDay);
  const focusedDay = propFocusedDay ?? storeFocusedDay;
  const setFocusedDay = useCalendarStore((state) => state.setFocusedDay);
  const lastUpdateSource = useCalendarStore((state) => state.lastUpdateSource);
  const isYearScrolling = useCalendarStore((state) => state.isYearScrolling);
  const toggleDaySelection = useCalendarStore(
    (state) => state.toggleDaySelection,
  );
  const storeSelectedRange = useCalendarStore((state) => state.selectedRange);
  const selectedRange =
    propSelectedRange !== undefined ? propSelectedRange : storeSelectedRange;
  const setSelectedRange = useCalendarStore((state) => state.setSelectedRange);

  // Gesture State
  const scrollY = useSharedValue(0);
  const isDragging = useRef(false);
  const dragStartDate = useRef<Date | null>(null);
  const pendingFocusedDay = useRef<Date | null>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Keep focusedDay in a ref for onViewableItemsChanged to avoid stale closures
  const focusedDayRef = useRef(focusedDay);
  useEffect(() => {
    focusedDayRef.current = focusedDay;
  }, [focusedDay]);

  const CELL_WIDTH = Math.floor(width / 7);
  const CELL_HEIGHT = Math.floor(CELL_WIDTH * 1.3);

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
  }, [width]);

  // Calculate Date from Point logic
  const getDateAtPoint = (x: number, y: number): Date | null => {
    const absoluteY = y + scrollY.value;

    const config = monthConfigs.find(
      (c) => absoluteY >= c.offset && absoluteY < c.offset + c.height,
    );
    if (!config) return null;

    const localY = absoluteY - config.offset;
    const row = Math.floor(localY / CELL_HEIGHT);
    const col = Math.floor(x / CELL_WIDTH);

    const dayIndex = row * 7 + col - config.startOffset;
    const dayNum = dayIndex + 1;

    if (dayNum >= 1 && dayNum <= config.daysInMonth) {
      return new Date(
        config.date.getFullYear(),
        config.date.getMonth(),
        dayNum,
      );
    }
    return null;
  };

  const handleDragUpdate = (
    x: number,
    y: number,
    state: 'start' | 'active' | 'end',
  ) => {
    if (state === 'end') {
      isDragging.current = false;
      dragStartDate.current = null;
      return;
    }

    const date = getDateAtPoint(x, y);
    if (!date) return;

    if (state === 'start') {
      isDragging.current = true;
      dragStartDate.current = date;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedRange({ start: date, end: date });
    } else if (
      state === 'active' &&
      isDragging.current &&
      dragStartDate.current
    ) {
      // Simple range logic for now
      // This logic in handleDragUpdate was actually correct in previous version
      // We just need to reimplement it cleanly if we removed `isBefore` imports etc.
      // Wait, I imported `isBefore` in my new code content above?
      // I missed `isBefore`, `isAfter`, `isSameDay` in imports in the code block above?
      // No, let me check imports in code block below.
      // I included `isBefore`, `isAfter`, `isSameDay` in imports.
      // Let's verify.

      /*
      import {
        getDaysInMonth,
        startOfMonth,
        endOfMonth,
        getDay,
        isSameMonth,
        // Missing isBefore, isAfter, isSameDay?
      } from 'date-fns';
      */

      // I'll make sure to include them.

      const start = date < dragStartDate.current ? date : dragStartDate.current;
      const end = date > dragStartDate.current ? date : dragStartDate.current;
      setSelectedRange({ start, end });
    }
  };

  const setDetailModal = useCalendarStore((state) => state.setDetailModal);
  const isModalOpen = useCalendarStore((state) => state.detailModal.isOpen);

  const handleTap = (x: number, y: number) => {
    const date = getDateAtPoint(x, y);
    if (date) {
      if (
        selectedRange &&
        selectedRange.start.getTime() !== selectedRange.end.getTime()
      ) {
        const startT = selectedRange.start.getTime();
        const endT = selectedRange.end.getTime();
        const dateT = date.getTime();

        if (dateT >= startT && dateT <= endT) {
          setDetailModal(true, null, selectedRange);
          return;
        }
      }

      if (onPressDay) {
        onPressDay(date);
        return;
      }

      toggleDaySelection(date);
      setDetailModal(true, date);
    }
  };

  const panGesture = Gesture.Pan()
    .enabled(!isModalOpen)
    .activateAfterLongPress(300)
    .simultaneousWithExternalGesture(flatListRef as any)
    .onStart((e) => {
      runOnJS(handleDragUpdate)(e.x, e.y, 'start');
    })
    .onUpdate((e) => {
      runOnJS(handleDragUpdate)(e.x, e.y, 'active');
    })
    .onEnd((e) => {
      runOnJS(handleDragUpdate)(e.x, e.y, 'end');
    })
    .onFinalize(() => {
      runOnJS(handleDragUpdate)(0, 0, 'end');
    });

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd((e) => {
      runOnJS(handleTap)(e.x, e.y);
    });

  const calculateVisibleDate = (y: number): Date | null => {
    // Logic: "Emphasize month when its 1st day appears at the top."
    // We identify which month block is at the top (y).

    // 1. Find the month config that simply covers the current scan line (y)
    // We look ahead significantly (1.5 cells) to prioritize the new month
    // as soon as its first row (Day 1) becomes visible near the top.
    const searchY = Math.max(0, y + CELL_HEIGHT * 1.5);

    const configIndex = monthConfigs.findIndex(
      (c) => searchY >= c.offset && searchY < c.offset + c.height,
    );

    if (configIndex === -1) return null;

    return monthConfigs[configIndex].date;
  };

  const handleScrollFinish = () => {
    const wasProgrammatic = isProgrammaticScroll.current;
    isProgrammaticScroll.current = false;
    if (programmaticScrollTimeout.current)
      clearTimeout(programmaticScrollTimeout.current);

    if (wasProgrammatic) {
      pendingFocusedDay.current = null;
      return;
    }

    // Use current scrollY value
    const currentY = scrollY.value;
    const newDate = calculateVisibleDate(currentY);

    if (newDate && !isSameMonth(newDate, focusedDayRef.current)) {
      if (onFocusedDayChange) {
        onFocusedDayChange(newDate);
      } else {
        setFocusedDay(newDate, 'grid');
      }
    }
  };

  const gestures = Gesture.Race(panGesture, tapGesture);

  useEffect(() => {
    if (!layoutReady) return;

    // Check if we need to scroll
    // If propFocusedDay is provided, we check if it is "programmatically needed"
    // i.e., is the user "already looking at" this month?

    // Calculate what the "Visible Month" is right now based on scrollY
    const visibleDate = calculateVisibleDate(scrollY.value);

    // If we are already looking at the month of focusedDay (according to our logic),
    // then WE DO NOT SCROLL. This prevents snapping.
    if (visibleDate && isSameMonth(visibleDate, focusedDay)) {
      return;
    }

    if (!propFocusedDay) {
      if (lastUpdateSource === 'grid') return;
      if (isYearScrolling) return;
    }

    // ... Proceed to scroll

    const diffYears = focusedDay.getFullYear() - BASE_YEAR;
    const diffMonths = diffYears * 12 + focusedDay.getMonth();

    const index = Math.max(0, Math.min(diffMonths, TOTAL_MONTHS - 1));
    const config = monthConfigs[index];

    isProgrammaticScroll.current = true;
    if (programmaticScrollTimeout.current)
      clearTimeout(programmaticScrollTimeout.current);

    programmaticScrollTimeout.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 1000);

    flatListRef.current?.scrollToOffset({
      offset: config.offset,
      animated: true,
    });
  }, [focusedDay, layoutReady, lastUpdateSource, isYearScrolling]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      // logic moved to handleScrollFinish / calculateVisibleDate
    },
  ).current;

  // Render Month Item using extracted component
  const renderItem = ({ item }: { item: MonthConfig }) => {
    return (
      <MonthItem
        item={item}
        width={width}
        CELL_WIDTH={CELL_WIDTH}
        selectedRange={selectedRange}
        showEvents={showEvents}
        isFocused={isSameMonth(item.date, focusedDay)}
      />
    );
  };

  return (
    <View style={{ flex: 1 }} testID="CalendarGrid">
      <View style={styles.weekdayHeader} testID="CalendarGrid-WeekHeader">
        {WEEKDAYS.map((day) => (
          <View
            key={day}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            testID={`CalendarGrid-WeekdayItem-${day}`}
          >
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>

      <GestureDetector gesture={gestures}>
        <Animated.FlatList
          ref={flatListRef}
          style={{ flex: 1 }}
          data={monthConfigs}
          renderItem={renderItem}
          keyExtractor={(item) => item.date.toISOString()}
          getItemLayout={(data, index) => ({
            length: monthConfigs[index].height,
            offset: monthConfigs[index].offset,
            index,
          })}
          onLayout={(e) => {
            setLayoutReady(true);
            containerHeight.current = e.nativeEvent.layout.height;
          }}
          initialScrollIndex={Math.max(
            0,
            Math.min(
              (focusedDay.getFullYear() - BASE_YEAR) * 12 +
                focusedDay.getMonth(),
              TOTAL_MONTHS - 1,
            ),
          )}
          initialNumToRender={2}
          windowSize={3} // Reduced for lighter initial load
          maxToRenderPerBatch={2}
          removeClippedSubviews={true}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={VIEWABILITY_CONFIG}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          onScrollBeginDrag={() => {
            isProgrammaticScroll.current = false;
            // Clear timeout if dragging starts
            if (programmaticScrollTimeout.current)
              clearTimeout(programmaticScrollTimeout.current);
          }}
          onScrollEndDrag={(e) => {
            if (e.nativeEvent.velocity?.y === 0) {
              handleScrollFinish();
            }
          }}
          onMomentumScrollEnd={handleScrollFinish}
          extraData={focusedDay}
        />
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  weekdayHeader: {
    height: 40,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.AppColors.gridLight,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
    zIndex: 1,
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.4,
  },
});
