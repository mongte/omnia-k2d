'use client';

import { AnimatePresence } from 'framer-motion';
import { useWorkoutStore } from '../model/useWorkoutStore';
import { StepBodyPart } from './StepBodyPart';
import { StepExercise } from './StepExercise';
import { StepWeight } from './StepWeight';
import { StepReps } from './StepReps';
import { StepPerformance } from './StepPerformance';

export function WorkoutWizard() {
  const step = useWorkoutStore((state) => state.step);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Step {step} of 5
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round((step / 5) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-2xl w-full mx-auto">
        <AnimatePresence mode="wait">
          {step === 1 && <StepBodyPart key="step-1" />}
          {step === 2 && <StepExercise key="step-2" />}
          {step === 3 && <StepWeight key="step-3" />}
          {step === 4 && <StepReps key="step-4" />}
          {step === 5 && <StepPerformance key="step-5" />}
        </AnimatePresence>
      </div>
    </div>
  );
}
