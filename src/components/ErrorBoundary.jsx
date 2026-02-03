import { Component } from 'react';
import { Result, Button } from 'antd';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Result
            status="error"
            title="Bir hata oluştu"
            subTitle={this.state.error?.message || "Bilinmeyen hata"}
            extra={[
              <Button 
                type="primary" 
                key="console"
                onClick={() => window.location.reload()}
              >
                Sayfayı Yenile
              </Button>,
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;