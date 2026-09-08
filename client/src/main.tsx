import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen bg-[#002D5A] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="bg-[#E52521] border-2 border-[#FCD116] px-4 py-1.5 rounded-xl shadow-lg transform -rotate-3">
            <span className="font-extrabold text-2xl italic tracking-tighter">
              <span className="text-[#FCD116]">U</span>N<span className="text-[#FCD116]">O</span>
            </span>
          </div>
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-xs text-white/70 max-w-sm">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-uno-yellow text-uno-navy font-black px-6 py-3 rounded-full text-xs shadow-md hover:scale-105 transition-transform"
          >
            RELOAD MATCH
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
