import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      err: null
    };
  }

  static getDerivedStateFromError(err) {
    return {
      hasError: true,
      err
    };
  }

  componentDidCatch(err, info) {
    console.error('caught app crash ->', err, info);

    // TODO: maybe send this to backend logs later
  }

  handleReset() {
    this.setState({
      hasError: false,
      err: null
    });

    window.location.reload();
  }

  render() {
    const { hasError, err } = this.state;

    if (hasError) {
      return (
        <div
          className="glass-panel animate-fade"
          style={{
            padding: '2rem',
            margin: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px'
          }}
        >
          <h2
            style={{
              color: 'hsl(0, 84%, 60%)',
              marginBottom: '1rem',
              fontFamily: 'Outfit, sans-serif'
            }}
          >
            Something went wrong
          </h2>

          <p
            style={{
              color: 'hsl(var(--text-secondary))',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              textAlign: 'center',
              maxWidth: '400px'
            }}
          >
            An unexpected error occurred in this view. The system state has
            been preserved.
          </p>

          <pre
            style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              width: '100%',
              maxWidth: '500px',
              overflowX: 'auto',
              marginBottom: '1.5rem',
              color: '#fda4af'
            }}
          >
            {err ? err.toString() : 'Unknown error'}
          </pre>

          <button
            className="glass-button primary"
            onClick={() => this.handleReset()}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}