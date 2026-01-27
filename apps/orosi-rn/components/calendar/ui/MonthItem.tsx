import { endOfMonth, isAfter, isBefore, isSameDay } from 'date-fns';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { CalendarCell } from '../CalendarCell';
import { MonthConfig } from '../model/calendarTypes';
import { useCalendarQueries } from '../model/useCalendarQueries';

interface MonthItemProps {
  item: MonthConfig;
  width: number;
  CELL_WIDTH: number;
  selectedRange?: { start: Date; end: Date } | null;
  showEvents?: boolean;
  isFocused?: boolean;
}

export const MonthItem = React.memo(
  ({
    item,
    width,
    CELL_WIDTH,
    selectedRange,
    showEvents = true,
    isFocused = false,
  }: MonthItemProps) => {
    // Fetch events via React Query
    const { data: eventsData } = useCalendarQueries().useMonthEvents(
      item.date,
      { enabled: showEvents },
    );

    // Group events by date for rendering O(N)
    const eventsByDay = useMemo(() => {
      if (!showEvents) return {};

      const map: Record<number, any[]> = {}; // Using any[] to match CalendarCell expectation temporarily, or ideally mapped structure
      if (!eventsData) return map;

      eventsData.forEach((e) => {
        const eventStart = new Date(e.start_time);
        const eventEnd = new Date(e.end_time);

        // Calculate intersection with current month
        // monthStart: 1st day of month at 00:00
        const monthStart = item.date;
        // monthEnd: last day of month at 23:59:59... or just simplify logic:
        // Loop through all days of this month (1..daysInMonth)
        // If a day is within [eventStart, eventEnd], add it.

        // Optimization: Determine start/end day numbers for this month
        let startDay = 1;
        let endDay = item.daysInMonth;

        // If event starts after month start (approx check: same month/year or later)
        // Check if eventStart is in this month
        if (
          eventStart.getMonth() === item.date.getMonth() &&
          eventStart.getFullYear() === item.date.getFullYear()
        ) {
          startDay = Math.max(startDay, eventStart.getDate());
        } else if (
          eventStart >
          new Date(item.date.getFullYear(), item.date.getMonth() + 1, 0)
        ) {
          // Event starts after this month
          return;
        }

        // If event ends in this month
        if (
          eventEnd.getMonth() === item.date.getMonth() &&
          eventEnd.getFullYear() === item.date.getFullYear()
        ) {
          endDay = Math.min(endDay, eventEnd.getDate());
        } else if (eventEnd < item.date) {
          // Event ends before this month
          return;
        }

        // Handle the case where event range doesn't overlap at all (already handled partially above)
        // Refined check:
        const absoluteMonthStart = item.date;
        const nextMonthStart = new Date(
          item.date.getFullYear(),
          item.date.getMonth() + 1,
          1,
        );

        if (eventEnd < absoluteMonthStart || eventStart >= nextMonthStart)
          return;

        // Loop days
        for (let day = startDay; day <= endDay; day++) {
          if (!map[day]) map[day] = [];
          // Avoid duplicates if any
          map[day].push({
            id: e.id,
            title: e.title,
            startTime: eventStart,
            endTime: eventEnd,
            color: e.color || '#ccc',
            isMultiDay: !isSameDay(eventStart, eventEnd),
          });
        }
      });
      return map;
    }, [eventsData, item.date, item.daysInMonth]);

    return (
      <View
        style={{
          height: item.height,
          width: width,
          flexDirection: 'row',
          flexWrap: 'wrap',
          overflow: 'hidden',
        }}
        testID="CalendarGrid-MonthItem"
      >
        {/* Empty Cells */}
        {Array.from({ length: item.startOffset }).map((_, i) => {
          const gridIndex = i;
          const colIndex = gridIndex % 7;
          const isLastColumn = colIndex === 6;

          // Check if the cell directly below has a valid day
          const belowIndex = gridIndex + 7;
          const hasDayBelow =
            belowIndex >= item.startOffset &&
            belowIndex < item.startOffset + item.daysInMonth;

          return (
            <CalendarCell
              key={`empty-${i}`}
              day={null}
              date={item.date}
              cellWidth={CELL_WIDTH}
              isLastColumn={isLastColumn}
              showBottomBorder={hasDayBelow}
            />
          );
        })}

        {/* Days */}
        {Array.from({ length: item.daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const date = new Date(
            item.date.getFullYear(),
            item.date.getMonth(),
            dayNum,
          );

          const events = eventsByDay[dayNum] || [];
          // TODO: Handle continuing events properly with new logic if needed
          const continuingEventIds = new Set<string>(); // Temporary empty until logic ported

          // Check selection locally
          let isSelected = false;
          let isStart = false;
          let isEnd = false;

          if (selectedRange) {
            const { start, end } = selectedRange;
            isStart = isSameDay(date, start);
            isEnd = isSameDay(date, end);
            isSelected =
              (isAfter(date, start) || isStart) &&
              (isBefore(date, end) || isEnd);
          }

          const gridIndex = item.startOffset + i;
          const colIndex = gridIndex % 7;
          const isLastColumn = colIndex === 6 || dayNum === item.daysInMonth;

          // Check if the cell directly below has a valid day
          const belowIndex = gridIndex + 7;
          const hasDayBelow =
            belowIndex >= item.startOffset &&
            belowIndex < item.startOffset + item.daysInMonth;

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
              continuingEventIds={continuingEventIds}
              cellWidth={CELL_WIDTH}
              isFocused={isFocused}
              isLastColumn={isLastColumn}
              showBottomBorder={hasDayBelow}
            />
          );
        })}

        {/* Trailing Cells */}
        {Array.from({
          length:
            Math.ceil((item.startOffset + item.daysInMonth) / 7) * 7 -
            (item.startOffset + item.daysInMonth),
        }).map((_, i) => {
          const gridIndex = item.startOffset + item.daysInMonth + i;
          const colIndex = gridIndex % 7;
          const isLastColumn = colIndex === 6;

          // Trailing cells are at the end, usually no valid day below them in this month grid context
          // (Next month starts after, but current logic confines to this month's days)
          const belowIndex = gridIndex + 7;
          const hasDayBelow =
            belowIndex >= item.startOffset &&
            belowIndex < item.startOffset + item.daysInMonth;

          return (
            <CalendarCell
              key={`trail-${i}`}
              day={null}
              date={item.date}
              cellWidth={CELL_WIDTH}
              isLastColumn={isLastColumn}
              showBottomBorder={hasDayBelow}
            />
          );
        })}

        {/* Special Case: Gap Row */}
        {item.rows * 7 >
          Math.ceil((item.startOffset + item.daysInMonth) / 7) * 7 &&
          Array.from({ length: 7 }).map((_, i) => {
            // Gap row is always the last row if it exists
            const isLastColumn = i === 6;
            const hasDayBelow = false; // Always bottom of grid

            return (
              <CalendarCell
                key={`gap-${i}`}
                day={null}
                date={item.date}
                cellWidth={CELL_WIDTH}
                isLastColumn={isLastColumn}
                showBottomBorder={hasDayBelow}
              />
            );
          })}
      </View>
    );
  },
  (prev, next) => {
    // 1. Basic Props Check
    if (
      prev.width !== next.width ||
      prev.CELL_WIDTH !== next.CELL_WIDTH ||
      prev.item !== next.item ||
      prev.showEvents !== next.showEvents ||
      prev.isFocused !== next.isFocused
    ) {
      return false;
    }

    // 2. Reference Check for Range
    if (prev.selectedRange === next.selectedRange) {
      return true;
    }

    // 3. Smart Intersection Check
    // If neither range touches this month, we don't need to re-render.
    const monthStart = prev.item.date;
    const monthEnd = endOfMonth(monthStart);

    const doesRangeIntersectMonth = (
      range: { start: Date; end: Date } | null | undefined,
    ) => {
      if (!range) return false;
      // Range: [start, end]
      // Month: [monthStart, monthEnd]
      // Intersects if: start <= monthEnd AND end >= monthStart
      return range.start <= monthEnd && range.end >= monthStart;
    };

    const prevIntersects = doesRangeIntersectMonth(prev.selectedRange);
    const nextIntersects = doesRangeIntersectMonth(next.selectedRange);

    // Optimization: If both are irrelevant to this month, skip render
    if (!prevIntersects && !nextIntersects) {
      return true;
    }

    return false;
  },
);
