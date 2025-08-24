import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/utils/logger';
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Uncaught application error:', { error: error.message, stack: error.stack, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              משהו השתבש
            </h1>
            <p className="text-gray-600 mb-6">
              אירעה שגיאה במערכת. אנא נסה לרענן את הדף או לפנות לתמיכה טכנית.
            </p>
            
            {this.state.error && (
              <details className="text-left mb-6 p-3 bg-gray-100 rounded text-sm">
                <summary className="cursor-pointer font-medium">פרטי השגיאה</summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            
            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleReset} variant="outline">
                נסה שוב
              </Button>
              <Button onClick={this.handleReload} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                רענן דף
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}