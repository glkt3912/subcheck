'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Report error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: reportErrorToService(error, errorInfo);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleClearData = () => {
    try {
      // Clear potentially corrupted localStorage data
      localStorage.removeItem('selectedSubscriptions');
      localStorage.removeItem('userSubscriptions');
      localStorage.removeItem('diagnosisResult');
      localStorage.removeItem('subcheck_custom_subscriptions');
      
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                ⚠️ エラーが発生しました
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-gray-700">
                <p className="mb-3">
                  申し訳ございません。予期しないエラーが発生しました。
                </p>
                <p className="text-sm text-gray-600">
                  以下のいずれかの方法をお試しください：
                </p>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={this.handleReset}
                  variant="outline"
                  className="w-full"
                >
                  🔄 再試行
                </Button>
                
                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                  className="w-full"
                >
                  🔃 ページを再読み込み
                </Button>
                
                <Button 
                  onClick={this.handleClearData}
                  variant="destructive"
                  className="w-full"
                >
                  🗑️ データをクリアして最初から
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-3 bg-gray-100 rounded text-xs">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    開発者向け情報
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap break-all">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap break-all">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // Report to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: reportErrorToService(error, errorInfo);
    }
  };

  return { handleError };
};

export default ErrorBoundary;