import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** Shown when a child throws during render (or in legacy lifecycles). */
  fallback: ReactNode
}

type State = { hasError: boolean }

/**
 * Catches synchronous React render errors in descendants so one failing widget
 * (e.g. WebGL / third-party canvas) does not blank the whole app.
 */
export default class RenderErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[RenderErrorBoundary]', error.message, info.componentStack)
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}
