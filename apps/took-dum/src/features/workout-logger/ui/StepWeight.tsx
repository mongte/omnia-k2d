'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useWorkoutStore } from '../model/useWorkoutStore';
import { WEIGHT_OPTIONS } from '@/shared/constants/bodyParts';

export function StepWeight() {
  const [selectedCoarse, setSelectedCoarse] = useState<number | null>(null);
  const weight = useWorkoutStore((state) => state.weight);
  const setWeight = useWorkoutStore((state) => state.setWeight);
  const nextStep = useWorkoutStore((state) => state.nextStep);
  const previousStep = useWorkoutStore((state) => state.previousStep);
  const exercise = useWorkoutStore((state) => state.exercise);

  const handleCoarseSelect = (value: number) => {
    setSelectedCoarse(value);
    setWeight(value);
  };

  const handleConfirm = () => {
    nextStep();
  };

  // Coarse 선택 후 Fine 조정 범위: ±5kg
  const fineMin = Math.max(0, (selectedCoarse || 0) - 5);
  const fineMax = (selectedCoarse || 0) + 5;

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
          <h2 className="text-2xl font-bold mb-2">{exercise?.name}</h2>
          <p className="text-muted-foreground">무게를 선택해주세요</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedCoarse === null ? (
          // Phase A: Coarse Selection (10kg 단위)
          <motion.div
            key="coarse"
            className="space-y-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="grid grid-cols-3 gap-3">
              {WEIGHT_OPTIONS.map((value) => (
                <motion.button
                  key={value}
                  onClick={() => handleCoarseSelect(value)}
                  className="touch-target p-4 rounded-lg bg-card hover:bg-accent transition-colors border-2 border-border hover:border-primary text-lg font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {value}kg
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          // Phase B: Fine Adjustment (±5kg 슬라이더)
          <motion.div
            key="fine"
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">{weight}kg</div>
              <p className="text-sm text-muted-foreground">
                {fineMin}kg ~ {fineMax}kg 범위에서 조정
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="range"
                min={fineMin}
                max={fineMax}
                step={1}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer slider"
              />

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{fineMin}kg</span>
                <span>{fineMax}kg</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedCoarse(null)}
                className="flex-1 touch-target px-6 py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors font-medium"
              >
                다시 선택
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 touch-target px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
              >
                다음
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
