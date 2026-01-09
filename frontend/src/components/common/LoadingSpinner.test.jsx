import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders spinner without message', () => {
    render(<LoadingSpinner />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with message', () => {
    render(<LoadingSpinner message="로딩 중..." />);
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('renders small size', () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-6', 'w-6');
  });

  it('renders medium size by default', () => {
    render(<LoadingSpinner />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-10', 'w-10');
  });

  it('renders large size', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-16', 'w-16');
  });

  it('renders full screen when fullScreen is true', () => {
    render(<LoadingSpinner fullScreen />);
    const container = document.querySelector('.min-h-screen');
    expect(container).toBeInTheDocument();
  });
});
