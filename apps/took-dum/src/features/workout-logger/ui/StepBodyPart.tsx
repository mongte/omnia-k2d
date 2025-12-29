'use client';

import { motion } from 'framer-motion';
import { BODY_PARTS } from '@shared/constants/bodyParts';
import { useWorkoutStore } from '../model/useWorkoutStore';
import type { BodyPart } from '@features/supabase/client';

export function StepBodyPart() {
  const selectBodyPart = useWorkoutStore((state) => state.selectBodyPart);

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">어떤 부위를 운동하셨나요?</h2>
        <p className="text-muted-foreground">운동 부위를 선택해주세요</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {BODY_PARTS.map((part) => {
          const Icon = part.icon;
          return (
            <motion.button
              key={part.name}
              onClick={() => selectBodyPart(part.name as BodyPart)}
              className="touch-target flex flex-col items-center justify-center gap-3 p-6 rounded-lg bg-card hover:bg-accent transition-colors border-2 border-border hover:border-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className={`w-10 h-10 ${part.color}`} />
              <span className="text-lg font-semibold">{part.name}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
