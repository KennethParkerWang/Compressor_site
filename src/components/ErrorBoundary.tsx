// ErrorBoundary - React 错误边界。任何 route 的 children 抛错都会被捕获,
//显示一个"重置"按钮 + 错误的简要位置,而不是让整个页面崩溃。
import React from 'react';

interface State {
  error: Error | null;
  info: string | null;
}

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, State> {
  state: State = {error: null, info: null};

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {error};
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
    this.setState({info: info.componentStack ?? null});
  }

  reset = (): void => {
    this.setState({error: null, info: null});
  };

  render(): React.ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <div
        role="alert"
        style={{
          maxWidth: 720,
          margin: '32px auto',
          padding: '20px 24px',
          border: '1px solid #fecaca',
          background: '#fef2f2',
          borderRadius: 10,
          color: '#7f1d1d',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <h2 style={{margin: 0, fontSize: 18, fontWeight: 700}}>页面渲染出错</h2>
        <p style={{margin: '8px 0 12px', fontSize: 14}}>
          这一页在加载时遇到了一个错误,下面是这个错误的简要位置。
        </p>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            background: '#fff',
            border: '1px solid #fecaca',
            borderRadius: 6,
            padding: 12,
            fontSize: 12,
            color: '#991b1b',
            maxHeight: 220,
            overflow: 'auto',
          }}
        >
          {this.state.error.message}
        </pre>
        {this.state.info ? (
          <details style={{marginTop: 12, fontSize: 12}}>
            <summary>查看组件调用栈</summary>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                background: '#fff7ed',
                padding: 10,
                borderRadius: 6,
                maxHeight: 200,
                overflow: 'auto',
              }}
            >
              {this.state.info.slice(0, 1500)}
            </pre>
          </details>
        ) : null}
        <button
          type="button"
          onClick={this.reset}
          style={{
            marginTop: 14,
            padding: '6px 14px',
            background: '#1f4ed8',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          重试
        </button>
      </div>
    );
  }
}
