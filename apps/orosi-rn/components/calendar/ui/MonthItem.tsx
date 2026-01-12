import React, { useMemo } from 'react';
import { View } from 'react-native';
import { MonthConfig, CalendarEvent } from '../model/calendarTypes';
import { CalendarCell } from '../CalendarCell';
import { useCalendarQueries } from '../model/useCalendarQueries';
import { useCalendarStore } from '../model/useCalendarStore';
import { isSameDay, isAfter, isBefore } from 'date-fns';

interface MonthItemProps {
  item: MonthConfig;
  width: number;
  CELL_WIDTH: number;
  selectedRange?: { start: Date; end: Date } | null;
}

export const MonthItem = React.memo(({ item, width, CELL_WIDTH, selectedRange: propSelectedRange }: MonthItemProps) => {
  // Fetch events via React Query
  const { data: eventsData } = useCalendarQueries().useMonthEvents(item.date);
  const storeSelectedRange = useCalendarStore((state) => state.selectedRange);
  const selectedRange = propSelectedRange !== undefined ? propSelectedRange : storeSelectedRange;

  // Group events by date for rendering O(N)
  const eventsByDay = useMemo(() => {
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
      if (eventStart.getMonth() === item.date.getMonth() && eventStart.getFullYear() === item.date.getFullYear()) {
          startDay = Math.max(startDay, eventStart.getDate());
      } else if (eventStart > new Date(item.date.getFullYear(), item.date.getMonth() + 1, 0)) {
          // Event starts after this month
          return;
      }

      // If event ends in this month
      if (eventEnd.getMonth() === item.date.getMonth() && eventEnd.getFullYear() === item.date.getFullYear()) {
          endDay = Math.min(endDay, eventEnd.getDate());
      } else if (eventEnd < item.date) {
         // Event ends before this month
         return;
      }
      
      // Handle the case where event range doesn't overlap at all (already handled partially above)
      // Refined check:
      const absoluteMonthStart = item.date;
      const nextMonthStart = new Date(item.date.getFullYear(), item.date.getMonth() + 1, 1);
      
      if (eventEnd < absoluteMonthStart || eventStart >= nextMonthStart) return;

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
      {Array.from({ length: item.startOffset }).map((_, i) => (
        <CalendarCell
          key={`empty-${i}`}
          day={null}
          date={item.date}
          cellWidth={CELL_WIDTH}
        />
      ))}

      {/* Days */}
      {Array.from({ length: item.daysInMonth }).map((_, i) => {
        const dayNum = i + 1;
        const date = new Date(
          item.date.getFullYear(),
          item.date.getMonth(),
          dayNum
        );

        const events = eventsByDay[dayNum] || [];
        // TODO: Handle continuing events properly with new logic if needed
        const continuingIds = new Set<string>(); // Temporary empty until logic ported

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
            cellWidth={CELL_WIDTH}
          />
        );
      })}

      {/* Trailing Cells */}
      {Array.from({
        length:
          Math.ceil((item.startOffset + item.daysInMonth) / 7) * 7 -
          (item.startOffset + item.daysInMonth),
      }).map((_, i) => (
        <CalendarCell
          key={`trail-${i}`}
          day={null}
          date={item.date}
          cellWidth={CELL_WIDTH}
        />
      ))}
      
      {/* Special Case: Gap Row */}
      {item.rows * 7 >
        Math.ceil((item.startOffset + item.daysInMonth) / 7) * 7 &&
        Array.from({ length: 7 }).map((_, i) => (
          <CalendarCell
            key={`gap-${i}`}
            day={null}
            date={item.date}
            cellWidth={CELL_WIDTH}
          />
        ))}
    </View>
  );
});
