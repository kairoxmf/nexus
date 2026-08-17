import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("NEXUS render error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: "100vh",
          background: "#0a0e14",
          color: "#ff4655",
          padding: 32,
          fontFamily: "IBM Plex Mono, monospace",
        }}>
          <h2 style={{ color: "#4cc9f0", fontFamily: "Rajdhani, sans-serif" }}>NEXUS Render Error</h2>
          <pre style={{ color: "#e8edf2", fontSize: 12, whiteSpace: "pre-wrap" }}>
            {this.state.error.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 16,
              padding: "10px 20px",
              background: "#4cc9f0",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
