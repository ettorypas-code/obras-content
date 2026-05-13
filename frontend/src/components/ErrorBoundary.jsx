import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('React crash:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: 'var(--bg)' }}>
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-lg font-bold mb-2" style={{ color: 'var(--label)' }}>Algo deu errado</p>
          <p className="text-sm mb-1" style={{ color: 'var(--label2)' }}>{this.state.error?.message}</p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}
            className="btn-primary mt-6"
          >
            Voltar ao início
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
