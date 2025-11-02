'use client';

import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Dynamic import for recharts to reduce initial bundle size
const WasteChart = lazy(() => import('./WasteChart'));

interface DynamicChartProps {
  diagnosisResult: any;
  subscriptionDetails: any;
}

export default function DynamicChart(props: DynamicChartProps) {
  return (
    <Suspense fallback={
      <div className="h-80 flex items-center justify-center">
        <LoadingSpinner size="lg" text="チャートを読み込み中..." />
      </div>
    }>
      <WasteChart {...props} />
    </Suspense>
  );
}