import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface p-6 font-sans">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-xl p-8 border border-outline-variant text-center">
            <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">error</span>
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-2">Something went wrong</h2>
            <p className="text-body-md text-on-surface-variant mb-6">
              An unexpected error occurred in the application.
            </p>
            {this.state.error && (
              <pre className="bg-surface-container-low text-left p-4 rounded-xl text-xs text-error font-mono overflow-auto max-h-40 mb-6">
                {this.state.error.toString()}
              </pre>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-label-lg hover:bg-primary/90 transition-colors"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-surface-container-high text-on-surface rounded-full font-label-lg hover:bg-surface-container-highest transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
