import { create } from 'zustand';
import type { BodyPart, Exercise } from '../../supabase/client';

export interface WorkoutState {
  // 현재 단계 (1-5)
  step: number;

  // 선택된 데이터
  bodyPart: BodyPart | null;
  exercise: Exercise | null;
  weight: number;
  reps: number;
  performanceScore: number;

  // 액션
  setStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  selectBodyPart: (bodyPart: BodyPart) => void;
  selectExercise: (exercise: Exercise) => void;
  setWeight: (weight: number) => void;
  setReps: (reps: number) => void;
  setPerformance: (score: number) => void;
  reset: () => void;
}

const initialState = {
  step: 1,
  bodyPart: null,
  exercise: null,
  weight: 20,
  reps: 12,
  performanceScore: 80,
};

export const useWorkoutStore = create<WorkoutState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  nextStep: () => set((state) => ({
    step: Math.min(state.step + 1, 5)
  })),

  previousStep: () => set((state) => ({
    step: Math.max(state.step - 1, 1)
  })),

  selectBodyPart: (bodyPart) => set({
    bodyPart,
    step: 2,
  }),

  selectExercise: (exercise) => set({
    exercise,
    step: 3,
  }),

  setWeight: (weight) => set({ weight }),

  setReps: (reps) => set({ reps }),

  setPerformance: (score) => set({ performanceScore: score }),

  reset: () => set(initialState),
}));
