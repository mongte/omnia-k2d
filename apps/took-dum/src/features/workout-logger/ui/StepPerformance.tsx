'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkoutStore } from '../model/useWorkoutStore';
import { supabase } from '@features/supabase/client';

export function StepPerformance() {
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const performanceScore = useWorkoutStore((state) => state.performanceScore);
  const setPerformance = useWorkoutStore((state) => state.setPerformance);
  const previousStep = useWorkoutStore((state) => state.previousStep);
  const reset = useWorkoutStore((state) => state.reset);

  const exercise = useWorkoutStore((state) => state.exercise);
  const weight = useWorkoutStore((state) => state.weight);
  const reps = useWorkoutStore((state) => state.reps);

  const handleSave = async () => {
    if (!exercise) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('workout_logs').insert({
        exercise_id: exercise.id,
        weight,
        reps,
        performance_score: performanceScore,
        user_id: null, // 인증 스킵 단계
      });

      if (error) {
        console.error('Error saving workout:', error);
        alert('기록 저장 중 오류가 발생했습니다.');
      } else {
        reset();
        router.push('/records');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('기록 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const getPerformanceLabel = (score: number) => {
    if (score < 30) return '너무 가벼웠어요';
    if (score < 60) return '적당했어요';
    if (score < 85) return '힘들었어요';
    return '실패 지점까지!';
  };

  const getPerformanceColor = (score: number) => {
    if (score < 30) return 'text-blue-500';
    if (score < 60) return 'text-green-500';
    if (score < 85) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={previousStep}
          disabled={saving}
          className="p-2 hover:bg-accent rounded-lg transition-colors disabled:opacity-50"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="flex-1 text-center">
          <h2 className="text-2xl font-bold mb-2">오늘 운동 어땠나요?</h2>
          <p className="text-muted-foreground">
            {exercise?.name} · {weight}kg x {reps}회
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <div className={`text-6xl font-bold mb-2 ${getPerformanceColor(performanceScore)}`}>
            {performanceScore}%
          </div>
          <p className={`text-xl font-medium ${getPerformanceColor(performanceScore)}`}>
            {getPerformanceLabel(performanceScore)}
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={performanceScore}
            onChange={(e) => setPerformance(Number(e.target.value))}
            className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer slider"
            disabled={saving}
          />

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>너무 가벼움</span>
            <span>실패 지점</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full touch-target px-6 py-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-bold text-lg disabled:opacity-50"
        >
          {saving ? '저장 중...' : '기록 완료'}
        </button>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </motion.div>
  );
}
