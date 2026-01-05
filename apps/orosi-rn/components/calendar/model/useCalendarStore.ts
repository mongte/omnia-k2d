import { DateRange, UpdateSource } from './calendarTypes';
import { create } from 'zustand';
import { isSameDay, isBefore, isAfter } from 'date-fns';

interface CalendarState {
  focusedDay: Date;
  lastUpdateSource: UpdateSource;
  selectedRange: DateRange | null;
  dragStarted: boolean;
  isYearScrolling: boolean;

  // Actions
  setFocusedDay: (date: Date, source?: UpdateSource) => void;
  setYearScrolling: (scrolling: boolean) => void;
  jumpToMonth: (date: Date) => void;
  toggleDaySelection: (date: Date) => void;
  clearSelection: () => void;
  startSelection: (date: Date) => void;
  updateSelection: (date: Date) => void;
  endSelection: () => void;
  
  // Selectors (Helpers as functions if needed, or derived state)
  // Zustand specific: we can keep these as logic in components or helper functions here.
  // For 'isDaySelected' etc, it's better to pass state to a selector function or just export helper functions.
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  focusedDay: new Date(),
  lastUpdateSource: 'user',
  selectedRange: null,
  dragStarted: false,
  isYearScrolling: false,

  setFocusedDay: (date, source = 'user') => set({ focusedDay: date, lastUpdateSource: source }),
  
  setYearScrolling: (scrolling) => set({ isYearScrolling: scrolling }),
  
  jumpToMonth: (date) => set({ focusedDay: date, lastUpdateSource: 'user' }), // Force user source to trigger effects

  toggleDaySelection: (date) => {
    const { selectedRange } = get();
    if (selectedRange && isSameDay(selectedRange.start, date) && isSameDay(selectedRange.end, date)) {
        set({ selectedRange: null });
    } else {
        set({ selectedRange: { start: date, end: date } });
    }
  },

  clearSelection: () => set({ selectedRange: null }),

  startSelection: (date) => set({ dragStarted: true, selectedRange: { start: date, end: date } }),

  updateSelection: (date) => {
    const { selectedRange } = get();
    if (!selectedRange) {
        set({ selectedRange: { start: date, end: date } });
        return;
    }
    
    // Logic from useCalendarController
    const start = isBefore(date, selectedRange.start) ? date : selectedRange.start;
    const end = isAfter(date, selectedRange.end) ? date : selectedRange.end;
    
    // Check if we need to update anchor logic? 
    // In hook we had: 
    // const start = isBefore(date, prev.start) ? date : prev.start;
    // const end = isAfter(date, prev.end) ? date : prev.end;
    // This simple logic only expands.
    // If user reverses direction, it won't shrink. 
    // But let's keep parity with previous implementation for now as requested.
    
    set({ selectedRange: { start, end } });
  },

  endSelection: () => set({ dragStarted: false }),
}));

// Helper Selectors
export const selectIsDaySelected = (state: CalendarState, date: Date) => {
    if (!state.selectedRange) return false;
    return (isAfter(date, state.selectedRange.start) || isSameDay(date, state.selectedRange.start)) &&
           (isBefore(date, state.selectedRange.end) || isSameDay(date, state.selectedRange.end));
};

export const selectIsRangeStart = (state: CalendarState, date: Date) => {
    return state.selectedRange ? isSameDay(date, state.selectedRange.start) : false;
};

export const selectIsRangeEnd = (state: CalendarState, date: Date) => {
    return state.selectedRange ? isSameDay(date, state.selectedRange.end) : false;
};
