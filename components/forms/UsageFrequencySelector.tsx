'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Subscription, UsageFrequency } from '@/types';

interface UsageFrequencySelectorProps {
  services: Subscription[];
  selectedServices: string[];
  usageFrequencies: Record<string, UsageFrequency>;
  onFrequencyChange: (serviceId: string, frequency: UsageFrequency) => void;
  disabled?: boolean;
}

const FREQUENCY_OPTIONS = [
  {
    value: UsageFrequency.DAILY,
    label: '毎日',
    description: 'ほぼ毎日使っている',
    subtext: '効率的な利用です',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '🟢',
    wasteMultiplier: 0
  },
  {
    value: UsageFrequency.WEEKLY,
    label: '週1-2回',
    description: '週に1〜2回程度使っている',
    subtext: '月額の25%が無駄になる計算',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '🟡',
    wasteMultiplier: 0.25
  },
  {
    value: UsageFrequency.MONTHLY,
    label: '月1-2回',
    description: '月に1〜2回程度使っている', 
    subtext: '月額の60%が無駄になる計算',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: '🟠',
    wasteMultiplier: 0.6
  },
  {
    value: UsageFrequency.UNUSED,
    label: '未使用',
    description: 'ほとんど使っていない',
    subtext: '月額の100%が無駄',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '🔴',
    wasteMultiplier: 1.0
  }
];

export default function UsageFrequencySelector({
  services,
  selectedServices,
  usageFrequencies,
  onFrequencyChange,
  disabled = false
}: UsageFrequencySelectorProps) {
  const getSelectedServices = () => {
    return selectedServices
      .map(id => services.find(service => service.id === id))
      .filter(Boolean) as Subscription[];
  };

  const handleFrequencySelect = (serviceId: string, frequency: UsageFrequency) => {
    if (disabled) return;
    onFrequencyChange(serviceId, frequency);
  };

  const getCompletionProgress = () => {
    const totalServices = selectedServices.length;
    const completedServices = Object.keys(usageFrequencies).filter(id => 
      selectedServices.includes(id)
    ).length;
    
    return {
      completed: completedServices,
      total: totalServices,
      percentage: totalServices > 0 ? Math.round((completedServices / totalServices) * 100) : 0
    };
  };

  const progress = getCompletionProgress();

  if (selectedServices.length === 0) {
    return (
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">🤔</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            サービスが選択されていません
          </h3>
          <p className="text-gray-500">
            まず最初にサブスクリプションサービスを選択してください
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Service Usage Input */}
      <div className="space-y-6">
        {getSelectedServices().map((service) => (
          <Card key={service.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  {service.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                  <p className="text-gray-600">月額 ¥{service.monthlyPrice.toLocaleString()}</p>
                  {usageFrequencies[service.id] && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ 選択済み: {FREQUENCY_OPTIONS.find(opt => opt.value === usageFrequencies[service.id])?.label}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {FREQUENCY_OPTIONS.map((option) => {
                  const isSelected = usageFrequencies[service.id] === option.value;
                  const monthlyWaste = service.monthlyPrice * option.wasteMultiplier;
                  const yearlyWaste = monthlyWaste * 12;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleFrequencySelect(service.id, option.value)}
                      disabled={disabled}
                      className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                        disabled ? 'opacity-50 cursor-not-allowed' :
                        isSelected
                          ? `${option.color} ring-2 ring-blue-500`
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{option.icon}</span>
                        <span className="font-semibold">{option.label}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{option.description}</p>
                      <p className="text-xs text-gray-500 mb-2">{option.subtext}</p>
                      
                      {/* Waste calculation preview */}
                      {option.wasteMultiplier > 0 && (
                        <div className="text-xs text-red-600 mt-2 pt-2 border-t border-gray-200 font-medium">
                          年間無駄: ¥{yearlyWaste.toLocaleString()}
                        </div>
                      )}
                      {option.wasteMultiplier === 0 && (
                        <div className="text-xs text-green-600 mt-2 pt-2 border-t border-gray-200 font-medium">
                          効率的な利用 👍
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">入力状況</h3>
              <p className="text-gray-700">
                {progress.completed} / {progress.total} 完了
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {progress.percentage}%
              </div>
              <div className="text-sm text-gray-600">完了</div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Completion status */}
          {progress.completed === progress.total && progress.total > 0 && (
            <div className="mt-4 flex items-center space-x-2 text-green-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">すべての入力が完了しました</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <span className="text-lg">💡</span>
            <div>
              <h4 className="font-semibold text-amber-800 mb-1">無駄の計算について</h4>
              <p className="text-sm text-amber-700 mb-2">
                <strong>月1-2回</strong>の利用は、月額料金に対して60%が「無駄」として計算されます。
                これは、毎日利用する場合と比較した効率性を示しています。
              </p>
              <p className="text-xs text-amber-600">
                💡 正直な利用頻度を選択することで、より正確な節約提案を得られます。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}