'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { JapaneseNumberUtils } from '@/lib/utils/japaneseUtils';
import { DiagnosisResult, UserSubscription, Subscription } from '@/types';

interface WasteChartProps {
  diagnosisResult: DiagnosisResult;
  subscriptionDetails: Record<string, Subscription>;
}

const USAGE_COLORS = {
  daily: '#10B981',    // Green - good usage
  weekly: '#F59E0B',   // Yellow - moderate usage
  monthly: '#EF4444',  // Red - poor usage
  unused: '#DC2626'    // Dark red - no usage
};

const USAGE_LABELS = {
  daily: '毎日使用',
  weekly: '週1-2回',
  monthly: '月1-2回',
  unused: '未使用'
};

// Custom tooltip component
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">
          月額: {JapaneseNumberUtils.formatPrice(data.value)}
        </p>
        <p className="text-sm text-gray-600">
          使用頻度: {USAGE_LABELS[data.usage as keyof typeof USAGE_LABELS]}
        </p>
        {data.wasteAmount > 0 && (
          <p className="text-sm text-red-600">
            年間無駄: {JapaneseNumberUtils.formatLargeNumber(data.wasteAmount)}
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Custom legend component
const CustomLegend = ({ payload }: { payload?: any[] }) => {
  if (!payload || !Array.isArray(payload)) return null;

  // Group by usage frequency
  const groupedData = payload.reduce((acc: any, item: any) => {
    if (!item || !item.payload) return acc;
    
    const usage = item.payload.usage;
    if (!usage) return acc; // Skip items without usage property
    
    if (!acc[usage]) {
      acc[usage] = {
        usage,
        color: USAGE_COLORS[usage as keyof typeof USAGE_COLORS] || '#6B7280',
        label: USAGE_LABELS[usage as keyof typeof USAGE_LABELS] || usage,
        services: [],
        totalValue: 0
      };
    }
    acc[usage].services.push(item.payload);
    acc[usage].totalValue += item.payload.value || 0;
    return acc;
  }, {});

  return (
    <div className="mt-4 space-y-2">
      {Object.values(groupedData).map((group: any) => (
        <div key={group.usage} className="flex items-center space-x-2">
          <div 
            className="w-4 h-4 rounded"
            style={{ backgroundColor: group.color }}
          />
          <span className="text-sm font-medium text-gray-700">
            {group.label}
          </span>
          <span className="text-sm text-gray-500">
            ({group.services.length}サービス, {JapaneseNumberUtils.formatPrice(group.totalValue)}/月)
          </span>
        </div>
      ))}
    </div>
  );
};

export default function WasteChart({ diagnosisResult, subscriptionDetails }: WasteChartProps) {
  // Validate inputs
  if (!diagnosisResult || !diagnosisResult.subscriptions || !subscriptionDetails) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-gray-500">
        <p>診断データが見つかりません</p>
      </div>
    );
  }

  // Prepare data for pie chart
  const chartData = diagnosisResult.subscriptions
    .filter((userSub: UserSubscription) => userSub && userSub.subscriptionId && userSub.usageFrequency)
    .map((userSub: UserSubscription) => {
      const service = subscriptionDetails[userSub.subscriptionId];
      if (!service) return null;

      const wasteMultiplier = {
        daily: 0,
        weekly: 0.25,
        monthly: 0.6,
        unused: 1.0
      }[userSub.usageFrequency] || 0;

      const monthlyWaste = (service.monthlyPrice || 0) * wasteMultiplier;
      const yearlyWaste = monthlyWaste * 12;

      return {
        name: service.name || 'Unknown Service',
        value: service.monthlyPrice || 0,
        wasteAmount: yearlyWaste,
        usage: userSub.usageFrequency,
        color: USAGE_COLORS[userSub.usageFrequency] || USAGE_COLORS.unused
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Handle empty chart data
  if (chartData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-gray-500">
        <p>表示するデータがありません</p>
      </div>
    );
  }

  // Custom label function for pie chart
  const renderLabel = (entry: any) => {
    const percent = ((entry.value / diagnosisResult.totals.monthly) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <div className="w-full">
      {/* Chart */}
      <div className="h-80 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <CustomLegend payload={chartData} />

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-bold text-green-600">
            {chartData.filter(item => item.usage === 'daily').length}
          </div>
          <div className="text-sm text-gray-600">毎日使用</div>
        </div>
        <div className="p-3 bg-yellow-50 rounded-lg">
          <div className="text-lg font-bold text-yellow-600">
            {chartData.filter(item => item.usage === 'weekly').length}
          </div>
          <div className="text-sm text-gray-600">週1-2回</div>
        </div>
        <div className="p-3 bg-orange-50 rounded-lg">
          <div className="text-lg font-bold text-orange-600">
            {chartData.filter(item => item.usage === 'monthly').length}
          </div>
          <div className="text-sm text-gray-600">月1-2回</div>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <div className="text-lg font-bold text-red-600">
            {chartData.filter(item => item.usage === 'unused').length}
          </div>
          <div className="text-sm text-gray-600">未使用</div>
        </div>
      </div>
    </div>
  );
}