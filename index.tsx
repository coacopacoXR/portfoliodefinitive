import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      const e = this.state.error as Error;
      return (
        <pre style={{
          position: 'fixed', inset: 0, padding: 24,
          background: '#1a1a1a', color: '#f97316',
          fontSize: 13, overflow: 'auto', whiteSpace: 'pre-wrap',
          fontFamily: 'monospace', zIndex: 9999
        }}>
          {'RENDER ERROR:\n\n' + e.message + '\n\n' + (e.stack ?? '')}
        </pre>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Could not find #root element');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
