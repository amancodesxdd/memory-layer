import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) return fallback(error);
      return (
        <div style={{ padding: 24, color: '#e5484d', fontFamily: 'sans-serif', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p>{error?.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={this.handleReset}
            style={{ padding: '8px 14px', cursor: 'pointer', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '6px' }}
          >
            Try again
          </button>
        </div>
      );
    }

    return children;
  }
}
