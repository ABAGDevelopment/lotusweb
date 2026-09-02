import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

type ErrorState = { error: Error | null }

/**
 * A render error anywhere unmounts the whole React tree, which would leave a
 * blank page with nothing to report. This keeps the failure legible.
 */
class RootErrorBoundary extends Component<{ children: ReactNode }, ErrorState> {
  state: ErrorState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[lotus] render error:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div
        role="alert"
        className="min-h-screen flex items-center justify-center p-6 bg-lotus-black text-lotus-text-off"
      >
        <div className="max-w-xl w-full space-y-4">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-lotus-yellow">
            Runtime error
          </p>
          <h1 className="font-display text-3xl font-bold uppercase">
            This page failed to render
          </h1>
          <pre className="p-4 rounded-sm border border-lotus-border bg-lotus-grey text-sm whitespace-pre-wrap break-words">
            {String(error.message || error)}
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-outline px-6 py-3 text-sm font-bold tracking-widest uppercase"
          >
            Reload
          </button>
        </div>
      </div>
    )
  }
}

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>,
)
