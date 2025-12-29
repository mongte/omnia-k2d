'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Dumbbell } from 'lucide-react';
import { useWorkoutStore } from '../model/useWorkoutStore';
import { supabase, type Exercise } from '@features/supabase/client';

export function StepExercise() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const bodyPart = useWorkoutStore((state) => state.bodyPart);
  const selectExercise = useWorkoutStore((state) => state.selectExercise);
  const previousStep = useWorkoutStore((state) => state.previousStep);

  useEffect(() => {
    if (!bodyPart) return;

    async function fetchExercises() {
      setLoading(true);
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('body_part', bodyPart)
        .order('name');

      if (error) {
        console.error('Error fetching exercises:', error);
      } else {
        setExercises(data || []);
      }
      setLoading(false);
    }

    fetchExercises();
  }, [bodyPart]);

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
          className="p-2 hover:bg-accent rounded-lg transition-colors"
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
          <h2 className="text-2xl font-bold mb-2">{bodyPart} 운동</h2>
          <p className="text-muted-foreground">어떤 운동을 하셨나요?</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {exercises.map((exercise) => (
            <motion.button
              key={exercise.id}
              onClick={() => selectExercise(exercise)}
              className="w-full touch-target flex items-center gap-4 p-4 rounded-lg bg-card hover:bg-accent transition-colors border-2 border-border hover:border-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Dumbbell className="w-6 h-6 text-primary" />
              <span className="text-lg font-medium">{exercise.name}</span>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
