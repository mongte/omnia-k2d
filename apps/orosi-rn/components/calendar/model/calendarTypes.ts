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
