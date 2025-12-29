'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, type WorkoutLog, type Exercise } from '@features/supabase/client';

interface WorkoutLogWithExercise extends WorkoutLog {
  exercise: Exercise;
}

interface DayData {
  date: string;
  count: number;
  logs: WorkoutLogWithExercise[];
}

export default function RecordsPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workoutData, setWorkoutData] = useState<Map<string, DayData>>(new Map());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    fetchWorkoutLogs();
  }, [month, year]);

  async function fetchWorkoutLogs() {
    setLoading(true);
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const { data, error } = await supabase
      .from('workout_logs')
      .select(`
        *,
        exercise:exercises(*)
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching workout logs:', error);
      setLoading(false);
      return;
    }

    const dataMap = new Map<string, DayData>();
    data.forEach((log: any) => {
      const dateStr = new Date(log.created_at).toISOString().split('T')[0];
      if (!dataMap.has(dateStr)) {
        dataMap.set(dateStr, { date: dateStr, count: 0, logs: [] });
      }
      const dayData = dataMap.get(dateStr)!;
      dayData.count++;
      dayData.logs.push({ ...log, exercise: log.exercise });
    });

    setWorkoutData(dataMap);
    setLoading(false);
  }

  function getIntensityClass(count: number) {
    if (count === 0) return 'bg-muted';
    if (count <= 2) return 'bg-green-900/40';
    if (count <= 5) return 'bg-green-700/60';
    return 'bg-green-500/80';
  }

  function generateCalendarGrid() {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Fill empty slots before first day
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Fill actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }

  const calendarDays = generateCalendarGrid();
  const selectedDayData = selectedDate ? workoutData.get(selectedDate) : null;

  // Calculate stats
  const totalWorkouts = Array.from(workoutData.values()).reduce(
    (sum, day) => sum + day.count,
    0
  );
  const bodyPartCounts = new Map<string, number>();
  workoutData.forEach((day) => {
    day.logs.forEach((log) => {
      const bodyPart = log.exercise.body_part;
      bodyPartCounts.set(bodyPart, (bodyPartCounts.get(bodyPart) || 0) + 1);
    });
  });
  const mostFrequentBodyPart = Array.from(bodyPartCounts.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>홈으로</span>
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1))}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">
          {year}년 {month + 1}월
        </h1>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1))}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Stats */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <h3 className="text-lg font-semibold mb-4">📊 이번 달 통계</h3>
        <div className="space-y-2">
          <p className="text-muted-foreground">
            총 운동: <span className="font-bold text-foreground">{totalWorkouts}회</span>
          </p>
          {mostFrequentBodyPart && (
            <p className="text-muted-foreground">
              가장 많이: <span className="font-bold text-foreground">{mostFrequentBodyPart[0]} ({mostFrequentBodyPart[1]}회)</span>
            </p>
          )}
        </div>
      </div>

      {/* Calendar Heatmap */}
      <div className="bg-card rounded-lg p-6 border border-border">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                <div key={day} className="text-center text-sm text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} />;
                }

                const dateStr = date.toISOString().split('T')[0];
                const dayData = workoutData.get(dateStr);
                const count = dayData?.count || 0;
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                const isSelected = dateStr === selectedDate;

                return (
                  <motion.button
                    key={dateStr}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`
                      aspect-square rounded-md transition-all
                      ${getIntensityClass(count)}
                      ${isSelected ? 'ring-2 ring-primary' : ''}
                      ${isToday ? 'ring-2 ring-yellow-500' : ''}
                      hover:ring-2 hover:ring-primary/50
                      flex items-center justify-center text-sm font-medium
                    `}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {date.getDate()}
                  </motion.button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4 text-sm">
              <span className="text-muted-foreground">적음</span>
              <div className="w-4 h-4 rounded bg-muted" />
              <div className="w-4 h-4 rounded bg-green-900/40" />
              <div className="w-4 h-4 rounded bg-green-700/60" />
              <div className="w-4 h-4 rounded bg-green-500/80" />
              <span className="text-muted-foreground">많음</span>
            </div>
          </>
        )}
      </div>

      {/* Selected Day Details */}
      {selectedDayData && (
        <motion.div
          className="bg-card rounded-lg p-6 border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-semibold mb-4">
            {new Date(selectedDate!).toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </h3>
          <div className="space-y-3">
            {selectedDayData.logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted"
              >
                <div>
                  <p className="font-medium">{log.exercise.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {log.exercise.body_part}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{log.weight}kg x {log.reps}회</p>
                  <p className="text-sm text-muted-foreground">
                    RPE: {log.performance_score}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
