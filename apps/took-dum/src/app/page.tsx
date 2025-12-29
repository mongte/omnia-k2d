'use client';

import { WorkoutWizard } from '@features/workout-logger/ui/WorkoutWizard';

export default function Home() {
  return (
    <main className="min-h-screen">
      <WorkoutWizard />
    </main>
  );
}
