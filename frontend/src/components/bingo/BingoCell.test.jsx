import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BingoCell from './BingoCell';

const mockCell = {
  id: 1,
  position: 0,
  is_activated: false,
  restaurant: {
    id: 1,
    name: '테스트 맛집',
    address: '서울시 강남구',
  },
};

describe('BingoCell', () => {
  it('renders restaurant name', () => {
    render(<BingoCell cell={mockCell} onClick={() => {}} />);
    expect(screen.getByText('테스트 맛집')).toBeInTheDocument();
  });

  it('shows inactive state by default', () => {
    render(<BingoCell cell={mockCell} onClick={() => {}} />);
    const cell = screen.getByText('테스트 맛집').closest('button');
    expect(cell).toHaveClass('bg-white');
  });

  it('shows active state when activated', () => {
    const activatedCell = { ...mockCell, is_activated: true };
    render(<BingoCell cell={activatedCell} onClick={() => {}} />);
    const cell = screen.getByText('테스트 맛집').closest('button');
    expect(cell).toHaveClass('bg-green-500');
  });

  it('shows check icon when activated', () => {
    const activatedCell = { ...mockCell, is_activated: true };
    render(<BingoCell cell={activatedCell} onClick={() => {}} />);
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<BingoCell cell={mockCell} onClick={handleClick} />);
    fireEvent.click(screen.getByText('테스트 맛집'));
    expect(handleClick).toHaveBeenCalledWith(mockCell);
  });

  it('shows highlight when isHighlighted is true', () => {
    render(<BingoCell cell={mockCell} onClick={() => {}} isHighlighted />);
    const cell = screen.getByText('테스트 맛집').closest('button');
    expect(cell).toHaveClass('ring-2', 'ring-amber-500');
  });
});
