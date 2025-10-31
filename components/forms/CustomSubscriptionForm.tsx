'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ValidationUtils, CustomSubscriptionInput } from '@/lib/utils/validation';
import { SubscriptionCategory } from '@/types';

interface CustomSubscriptionFormProps {
  onSubmit: (customSubscription: CustomSubscriptionInput) => void;
  onCancel: () => void;
  existingServices?: { name: string }[];
  isLoading?: boolean;
  initialData?: CustomSubscriptionInput;
}

const CATEGORY_OPTIONS = [
  { value: SubscriptionCategory.VIDEO, label: '📺 動画配信サービス' },
  { value: SubscriptionCategory.MUSIC, label: '🎵 音楽配信サービス' },
  { value: SubscriptionCategory.GAMING, label: '🎮 ゲームサービス' },
  { value: SubscriptionCategory.READING, label: '📚 読書サービス' },
  { value: SubscriptionCategory.UTILITY, label: '🛠️ ユーティリティ' },
  { value: SubscriptionCategory.OTHER, label: '📱 その他' }
];

export default function CustomSubscriptionForm({
  onSubmit,
  onCancel,
  existingServices = [],
  isLoading = false,
  initialData
}: CustomSubscriptionFormProps) {
  const [formData, setFormData] = useState<CustomSubscriptionInput>(
    initialData || {
      name: '',
      monthlyPrice: 0,
      category: SubscriptionCategory.OTHER
    }
  );
  
  const [errors, setErrors] = useState<{
    name?: string;
    monthlyPrice?: string;
    category?: string;
  }>({});
  
  const [touched, setTouched] = useState<{
    name?: boolean;
    monthlyPrice?: boolean;
    category?: boolean;
  }>({});

  const validateField = (fieldName: keyof CustomSubscriptionInput, value: string | number) => {
    let validation;
    
    switch (fieldName) {
      case 'name':
        validation = ValidationUtils.validateServiceName(value as string);
        if (validation.isValid) {
          // Check for duplicates
          validation = ValidationUtils.checkDuplicateName(value as string, existingServices);
        }
        break;
      case 'monthlyPrice':
        validation = ValidationUtils.validateMonthlyPrice(value as number);
        break;
      case 'category':
        validation = ValidationUtils.validateCategory(value as string);
        break;
      default:
        validation = { isValid: true };
    }
    
    return validation;
  };

  const handleInputChange = (fieldName: keyof CustomSubscriptionInput, value: string | number) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Auto-suggest category when name changes
    if (fieldName === 'name' && typeof value === 'string' && value) {
      const suggestedCategory = ValidationUtils.suggestCategory(value as string);
      if (suggestedCategory !== formData.category) {
        setFormData(prev => ({ ...prev, category: suggestedCategory as SubscriptionCategory }));
      }
    }
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  const handleBlur = (fieldName: keyof CustomSubscriptionInput) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    const validation = validateField(fieldName, formData[fieldName] as string | number);
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, [fieldName]: validation.error }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ name: true, monthlyPrice: true, category: true });
    
    // Validate all fields
    const nameValidation = validateField('name', formData.name);
    const priceValidation = validateField('monthlyPrice', formData.monthlyPrice);
    const categoryValidation = validateField('category', formData.category);
    
    const newErrors = {
      name: nameValidation.isValid ? undefined : nameValidation.error,
      monthlyPrice: priceValidation.isValid ? undefined : priceValidation.error,
      category: categoryValidation.isValid ? undefined : categoryValidation.error
    };
    
    setErrors(newErrors);
    
    // Check if form is valid
    if (Object.values(newErrors).every(error => !error)) {
      // Sanitize and format data before submission
      const sanitizedData: CustomSubscriptionInput = {
        name: ValidationUtils.sanitizeServiceName(formData.name),
        monthlyPrice: ValidationUtils.formatPrice(formData.monthlyPrice),
        category: formData.category
      };
      
      onSubmit(sanitizedData);
    }
  };

  const isFormValid = () => {
    return formData.name.trim().length > 0 && 
           formData.monthlyPrice > 0 && 
           formData.category &&
           Object.values(errors).every(error => !error);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          カスタムサービス追加
        </CardTitle>
        <p className="text-sm text-gray-600">
          リストにないサブスクリプションサービスを追加できます
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Name */}
          <div>
            <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700 mb-2">
              サービス名 <span className="text-red-500">*</span>
            </label>
            <input
              id="serviceName"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="例: 新しい動画サービス"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name && touched.name 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}
              maxLength={ValidationUtils.MAX_NAME_LENGTH}
              disabled={isLoading}
            />
            {errors.name && touched.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.name.length}/{ValidationUtils.MAX_NAME_LENGTH}文字
            </p>
          </div>

          {/* Monthly Price */}
          <div>
            <label htmlFor="monthlyPrice" className="block text-sm font-medium text-gray-700 mb-2">
              月額料金 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">¥</span>
              <input
                id="monthlyPrice"
                type="number"
                min={ValidationUtils.MIN_PRICE}
                max={ValidationUtils.MAX_PRICE}
                step="1"
                value={formData.monthlyPrice || ''}
                onChange={(e) => handleInputChange('monthlyPrice', e.target.value)}
                onBlur={() => handleBlur('monthlyPrice')}
                placeholder="1,000"
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.monthlyPrice && touched.monthlyPrice 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
            </div>
            {errors.monthlyPrice && touched.monthlyPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.monthlyPrice}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {ValidationUtils.MIN_PRICE}円〜{ValidationUtils.MAX_PRICE.toLocaleString()}円で入力してください
            </p>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              onBlur={() => handleBlur('category')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category && touched.category 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300'
              }`}
              disabled={isLoading}
            >
              {CATEGORY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.category && touched.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Preview */}
          {formData.name && formData.monthlyPrice > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2">プレビュー</h4>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {formData.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{formData.name}</p>
                  <p className="text-sm text-gray-600">
                    月額 ¥{formData.monthlyPrice ? formData.monthlyPrice.toLocaleString() : 0}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? '追加中...' : '追加'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}