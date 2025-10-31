'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Subscription, SubscriptionCategory } from '@/types';

interface SubscriptionSelectorProps {
  services: Subscription[];
  selectedServices: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  disabled?: boolean;
}

const CATEGORY_CONFIG = {
  [SubscriptionCategory.VIDEO]: {
    label: '動画配信サービス',
    icon: '📺',
    gradient: 'from-red-500 to-pink-500'
  },
  [SubscriptionCategory.MUSIC]: {
    label: '音楽配信サービス',
    icon: '🎵',
    gradient: 'from-green-500 to-blue-500'
  },
  [SubscriptionCategory.GAMING]: {
    label: 'ゲームサービス',
    icon: '🎮',
    gradient: 'from-purple-500 to-indigo-500'
  },
  [SubscriptionCategory.READING]: {
    label: '読書サービス',
    icon: '📚',
    gradient: 'from-orange-500 to-red-500'
  },
  [SubscriptionCategory.UTILITY]: {
    label: 'ユーティリティ',
    icon: '🛠️',
    gradient: 'from-gray-500 to-slate-500'
  },
  [SubscriptionCategory.OTHER]: {
    label: 'その他',
    icon: '📱',
    gradient: 'from-teal-500 to-cyan-500'
  }
};

export default function SubscriptionSelector({
  services,
  selectedServices,
  onSelectionChange,
  disabled = false
}: SubscriptionSelectorProps) {
  const handleServiceToggle = (serviceId: string) => {
    if (disabled) return;
    
    const isSelected = selectedServices.includes(serviceId);
    const newSelection = isSelected
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId];
    
    onSelectionChange(newSelection);
  };

  const getServicesByCategory = (category: SubscriptionCategory) => {
    return services.filter(service => 
      service && 
      service.category === category && 
      service.name && 
      typeof service.monthlyPrice === 'number'
    );
  };

  const renderCategorySection = (category: SubscriptionCategory) => {
    const categoryServices = getServicesByCategory(category);
    if (categoryServices.length === 0) return null;

    const config = CATEGORY_CONFIG[category];

    return (
      <section key={category} className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-2xl mr-2">{config.icon}</span>
          {config.label}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryServices.map((service) => (
            <Card 
              key={service.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                disabled ? 'opacity-50 cursor-not-allowed' :
                selectedServices.includes(service.id) 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleServiceToggle(service.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${config.gradient} rounded-lg flex items-center justify-center text-white font-bold`}>
                    {service.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-600">月額 ¥{(service.monthlyPrice || 0).toLocaleString()}</p>
                    {service.isPopular && (
                      <span className="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full mt-1">
                        人気
                      </span>
                    )}
                  </div>
                  {selectedServices.includes(service.id) && (
                    <div className="text-blue-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  };

  // Calculate total monthly cost of selected services
  const getTotalMonthlyCost = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.monthlyPrice || 0);
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Render each category */}
      {Object.values(SubscriptionCategory).map(category => 
        renderCategorySection(category)
      )}

      {/* Selection Summary */}
      {selectedServices.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-2">選択済みサービス</h3>
            <p className="text-gray-700">
              {selectedServices.length}個のサービスを選択中
            </p>
            <div className="mt-2 text-sm text-gray-600">
              合計月額: ¥{getTotalMonthlyCost().toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              年額: ¥{(getTotalMonthlyCost() * 12).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {selectedServices.length === 0 && !disabled && (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              サービスを選択してください
            </h3>
            <p className="text-gray-500">
              利用中のサブスクリプションサービスをクリックして選択してください
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}