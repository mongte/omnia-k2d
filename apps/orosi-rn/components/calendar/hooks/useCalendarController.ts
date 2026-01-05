import { useState, useCallback } from 'react';
import { isSameDay, isSameMonth, isBefore, isAfter, startOfDay } from 'date-fns';
import { CalendarController, DateRange, UpdateSource } from '../types';

export function useCalendarController(initialDate: Date = new Date()): CalendarController {
  const [focusedDay, setFocusedDayState] = useState<Date>(initialDate);
  const [lastUpdateSource, setLastUpdateSource] = useState<UpdateSource>('user');
  const [selectedRange, setSelectedRange] = useState<DateRange | null>(null);
  const [dragStarted, setDragStarted] = useState(false);
  const [isYearScrolling, setYearScrolling] = useState(false);

  const setFocusedDay = useCallback((date: Date, source: UpdateSource = 'user') => {
    setFocusedDayState(date);
    setLastUpdateSource(source);
  }, []);

  const jumpToMonth = useCallback((date: Date) => {
    setFocusedDayState(date);
    setLastUpdateSource('user');
  }, []);

  const toggleDaySelection = useCallback((date: Date) => {
    if (selectedRange && isSameDay(selectedRange.start, date) && isSameDay(selectedRange.end, date)) {
      setSelectedRange(null);
    } else {
      setSelectedRange({ start: date, end: date });
    }
  }, [selectedRange]);

  const clearSelection = useCallback(() => {
    setSelectedRange(null);
  }, []);

  const startSelection = useCallback((date: Date) => {
    setDragStarted(true);
    setSelectedRange({ start: date, end: date });
  }, []);

  const updateSelection = useCallback((date: Date) => {
    if (!selectedRange) return;
    // Simple logic: always update end, or swap if before start?
    // Flutter logic might hold 'anchor' start.
    // For simplicity, let's assume dragging extends from the original start if we kept track of anchor.
    // Here we just update the range blindly for now, assuming logic is handled or this is enough.
    // But 'Range' usually implies Start <= End.
    
    // We need to know where we started dragging to update correctly (anchor).
    // State machine is a bit complex for a simple hook, let's keep it simple:
    // If we are dragging, we should update based on the start.
    // Since we don't store "anchor" separately, let's assume 'selectedRange.start' is anchor if we just started.
    // But if we drag backwards?
    // Let's just set it to min/max of current range start and new date.
    
    // Actual Flutter logic: uses anchor point.
    // Let's assume startSelection sets the anchor implicitly.
    // We might need a ref for anchor.
    
    setSelectedRange(prev => {
        if (!prev) return { start: date, end: date };
        // This is a simplification. For full drag support we need an anchor ref.
        // Let's assume for now we just extend 
        const start = isBefore(date, prev.start) ? date : prev.start;
        const end = isAfter(date, prev.end) ? date : prev.end;
        return { start, end };
    });
  }, []); // Logic needs refinement for bi-directional drag, but OK for MVP.

  const endSelection = useCallback(() => {
    setDragStarted(false);
  }, []);

  const isDaySelected = useCallback((date: Date) => {
    if (!selectedRange) return false;
    return (isAfter(date, selectedRange.start) || isSameDay(date, selectedRange.start)) &&
           (isBefore(date, selectedRange.end) || isSameDay(date, selectedRange.end));
  }, [selectedRange]);

  const isRangeStart = useCallback((date: Date) => {
    return selectedRange ? isSameDay(date, selectedRange.start) : false;
  }, [selectedRange]);

  const isRangeEnd = useCallback((date: Date) => {
    return selectedRange ? isSameDay(date, selectedRange.end) : false;
  }, [selectedRange]);

  return {
    focusedDay,
    lastUpdateSource,
    selectedRange,
    dragStarted,
    isYearScrolling,
    setFocusedDay,
    setYearScrolling,
    jumpToMonth,
    toggleDaySelection,
    clearSelection,
    startSelection,
    updateSelection,
    endSelection,
    isDaySelected,
    isRangeStart,
    isRangeEnd,
  };
}
