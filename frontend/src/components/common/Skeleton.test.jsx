import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonCard, SkeletonBingoGrid, SkeletonFeedItem } from './Skeleton';

describe('SkeletonCard', () => {
  it('should render with animate-pulse', () => {
    const { container } = render(<SkeletonCard />);
    const el = container.firstChild;
    expect(el.className).toContain('animate-pulse');
  });
});

describe('SkeletonBingoGrid', () => {
  it('should render 25 cells', () => {
    render(<SkeletonBingoGrid />);
    const cells = screen.getAllByTestId('skeleton-cell');
    expect(cells).toHaveLength(25);
  });
});

describe('SkeletonFeedItem', () => {
  it('should render with animate-pulse', () => {
    const { container } = render(<SkeletonFeedItem />);
    const el = container.firstChild;
    expect(el.className).toContain('animate-pulse');
  });
});
