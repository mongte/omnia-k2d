export type CalendarEvent = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  color: string;
  isMultiDay?: boolean;
};

export type DateRange = {
  start: Date;
  end: Date;
};

export type UpdateSource = 'header' | 'grid' | 'user';

export interface MonthConfig {
  date: Date;
  offset: number;
  height: number;
  rows: number;
  startOffset: number; // Empty cells before 1st day
  daysInMonth: number;
}

export interface CalendarEventDisplayInfo {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  color: string;
  isMultiDay: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isContinuing: boolean;
}

export { EventPriority } from '@/lib/database.types';
