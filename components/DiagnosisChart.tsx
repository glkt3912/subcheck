'use client';

import { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

interface DiagnosisChartProps {
  data: ChartData[];
}

const DiagnosisChart = memo(({ data }: DiagnosisChartProps) => {
  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        データがありません
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }: any) => `${name}: ¥${(value as number).toLocaleString()}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`¥${value.toLocaleString()}`, '月額']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

DiagnosisChart.displayName = 'DiagnosisChart';

export default DiagnosisChart;