export type CalendarEvent = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  color: string;
};

export type DateRange = {
  start: Date;
  end: Date;
};

export type UpdateSource = 'header' | 'grid' | 'user';

export interface CalendarController {
  focusedDay: Date;
  lastUpdateSource: UpdateSource;
  selectedRange: DateRange | null;
  dragStarted: boolean;
  isYearScrolling: boolean;

  setFocusedDay: (date: Date, source?: UpdateSource) => void;
  setYearScrolling: (scrolling: boolean) => void;
  jumpToMonth: (date: Date) => void;
  
  // Selection
  toggleDaySelection: (date: Date) => void;
  clearSelection: () => void;
  startSelection: (date: Date) => void;
  updateSelection: (date: Date) => void;
  endSelection: () => void;

  // Helpers
  isDaySelected: (date: Date) => boolean;
  isRangeStart: (date: Date) => boolean;
  isRangeEnd: (date: Date) => boolean;
}
