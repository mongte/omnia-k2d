import type { BodyPart } from '@features/supabase/client';
import { Dumbbell, Activity, Footprints, Zap, Flame, Wind } from 'lucide-react';

export const BODY_PARTS: Array<{
  name: BodyPart;
  icon: typeof Dumbbell;
  color: string;
}> = [
  { name: '가슴', icon: Dumbbell, color: 'text-red-500' },
  { name: '등', icon: Activity, color: 'text-blue-500' },
  { name: '하체', icon: Footprints, color: 'text-green-500' },
  { name: '어깨', icon: Zap, color: 'text-yellow-500' },
  { name: '팔', icon: Flame, color: 'text-orange-500' },
  { name: '복근', icon: Activity, color: 'text-purple-500' },
  { name: '유산소', icon: Wind, color: 'text-cyan-500' },
];

// 무게 선택 (10kg 단위)
export const WEIGHT_OPTIONS = Array.from({ length: 11 }, (_, i) => i * 10); // 0, 10, 20, ..., 100

// 횟수 선택 (6회 단위)
export const REPS_OPTIONS = Array.from({ length: 7 }, (_, i) => (i + 1) * 6); // 6, 12, 18, 24, 30, 36, 42
