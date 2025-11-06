'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, PieLabelRenderProps } from 'recharts';
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

interface TooltipPayload {
  payload: {
    name: string;
    value: number;
    usage: string;
    wasteAmount: number;
    serviceCount?: number;
    services?: string[];
  };
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">
          {data.serviceCount}サービス: {JapaneseNumberUtils.formatPrice(data.value)}/月
        </p>
        {data.services && (
          <p className="text-xs text-gray-500">
            {data.services.join(', ')}
          </p>
        )}
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
interface LegendPayload {
  payload: {
    usage: string;
    value: number;
  };
}

const CustomLegend = ({ payload }: { payload?: LegendPayload[] }) => {
  if (!payload || !Array.isArray(payload)) return null;

  // Group by usage frequency
  const groupedData = payload.reduce((acc: Record<string, {
    usage: string;
    color: string;
    label: string;
    services: { name: string; value: number; usage: string }[];
    totalValue: number;
  }>, item: LegendPayload) => {
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
    acc[usage].services.push({
      name: (item.payload as { name?: string; value: number; usage: string }).name || 'Unknown',
      value: item.payload.value || 0,
      usage: item.payload.usage || usage
    });
    acc[usage].totalValue += item.payload.value || 0;
    return acc;
  }, {});

  return (
    <div className="mt-4 space-y-2">
      {Object.values(groupedData).map((group) => (
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

  // Prepare data for pie chart - Group by usage frequency
  const frequencyGroups = diagnosisResult.subscriptions
    .filter((userSub: UserSubscription) => userSub && userSub.subscriptionId && userSub.usageFrequency)
    .reduce((groups: Record<string, { totalPrice: number; services: string[]; wasteAmount: number }>, userSub: UserSubscription) => {
      const service = subscriptionDetails[userSub.subscriptionId];
      if (!service) return groups;

      const frequency = userSub.usageFrequency;
      if (!groups[frequency]) {
        groups[frequency] = { totalPrice: 0, services: [], wasteAmount: 0 };
      }

      const wasteMultiplier = {
        daily: 0,
        weekly: 0.25,
        monthly: 0.6,
        unused: 1.0
      }[frequency] || 0;

      const monthlyWaste = (service.monthlyPrice || 0) * wasteMultiplier;

      groups[frequency].totalPrice += service.monthlyPrice || 0;
      groups[frequency].services.push(service.name || 'Unknown');
      groups[frequency].wasteAmount += monthlyWaste * 12;

      return groups;
    }, {});

  const chartData = Object.entries(frequencyGroups).map(([frequency, data]) => ({
    name: USAGE_LABELS[frequency as keyof typeof USAGE_LABELS] || frequency,
    value: data.totalPrice,
    wasteAmount: data.wasteAmount,
    usage: frequency,
    serviceCount: data.services.length,
    services: data.services,
    color: USAGE_COLORS[frequency as keyof typeof USAGE_COLORS] || USAGE_COLORS.unused
  }));

  // Handle empty chart data
  if (chartData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-gray-500">
        <p>表示するデータがありません</p>
      </div>
    );
  }

  // Custom label function for pie chart
  const renderLabel = (props: PieLabelRenderProps) => {
    const value = Number(props.value) || 0;
    const percent = ((value / diagnosisResult.totals.monthly) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <div className="w-full">
      {/* Chart Title */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">使用頻度別月額割合</h3>
        <p className="text-sm text-gray-600">円グラフは月額料金に占める各使用頻度の割合を表示しています</p>
      </div>
      
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
      <CustomLegend payload={chartData.map(item => ({ payload: item }))} />

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