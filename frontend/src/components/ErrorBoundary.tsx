import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends (React.Component as any) {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled UI error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.removeItem('csjmu_reports');
      localStorage.removeItem('csjmu_activities');
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 w-full">
          <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 shadow-xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
              <AlertOctagon className="w-7 h-7" />
            </div>
            
            <h3 className="text-lg font-black text-slate-900 mb-2">
              {this.props.fallbackTitle || 'Component Encountered a Glitch'}
            </h3>
            
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              An unexpected display issue occurred in this section. The rest of the portal remains functional, or you can safely reload to refresh telemetry.
            </p>

            {this.state.error && (
              <div className="mb-5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-left overflow-x-auto max-h-32">
                <p className="text-[11px] font-mono text-rose-700 font-semibold">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#001e40] text-white text-xs font-bold hover:bg-[#003366] transition-colors cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Portal
              </button>

              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
              >
                <Home className="w-3.5 h-3.5" />
                Reset Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
