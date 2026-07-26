import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[300px] bg-[#0a0f1c] rounded-2xl border border-red-500/20 p-8 flex flex-col items-center justify-center text-center text-slate-300">
          <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center text-red-400 mb-4 border border-red-500/20">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {this.props.fallbackTitle || 'Something went wrong loading this component'}
          </h3>
          <p className="text-sm text-slate-400 max-w-md mb-6">
            {this.state.error?.message || 'An unexpected error occurred during rendering or initialization.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
