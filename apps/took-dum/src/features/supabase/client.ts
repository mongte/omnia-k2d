import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface Exercise {
  id: string;
  name: string;
  body_part: string;
  icon_slug: string;
  created_at: string;
}

export interface WorkoutLog {
  id: string;
  user_id: string | null;
  exercise_id: string;
  weight: number;
  reps: number;
  performance_score: number;
  created_at: string;
}

export type BodyPart = '가슴' | '등' | '하체' | '어깨' | '팔' | '복근' | '유산소';
