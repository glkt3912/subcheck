'use client';

import { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, PieLabelRenderProps } from 'recharts';
import { cn } from "@/lib/utils";

interface ChartData {
  name: string;
  value: number;
  color: string;
  wasteAmount?: number;
  usage?: string;
  [key: string]: string | number | undefined;
}

interface DiagnosisChartProps {
  data: ChartData[];
}


const DiagnosisChart = memo(({ data }: DiagnosisChartProps) => {
  if (data.length === 0) {
    return (
      <div className={cn("h-80 flex items-center justify-center text-gray-500")}> 
        データがありません
      </div>
    );
  }

  return (
    <div className={cn("h-80")}> 
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props: PieLabelRenderProps) => `${props.name || ''}: ¥${props.value?.toLocaleString() || '0'}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`¥${value.toLocaleString()}`, '月額']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

DiagnosisChart.displayName = 'DiagnosisChart';

export default DiagnosisChart;