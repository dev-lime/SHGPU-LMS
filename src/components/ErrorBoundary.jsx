// src/components/ErrorBoundary.jsx
import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Error Boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div>Что-то пошло не так. Пожалуйста, перезагрузите страницу.</div>;
    }
    return this.props.children;
  }
}
