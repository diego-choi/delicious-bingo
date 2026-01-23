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
    expect(cell).toHaveClass('bg-cell-inactive');
  });

  it('shows active state when activated', () => {
    const activatedCell = { ...mockCell, is_activated: true };
    render(<BingoCell cell={activatedCell} onClick={() => {}} />);
    const cell = screen.getByText('테스트 맛집').closest('button');
    expect(cell).toHaveClass('bg-brand-orange');
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
    expect(cell).toHaveClass('ring-2', 'ring-brand-orange');
  });

  it('shows image overlay when activated with review image', () => {
    const cellWithImage = {
      ...mockCell,
      is_activated: true,
      review: {
        id: 1,
        image: 'https://example.com/food.jpg',
      },
    };
    render(<BingoCell cell={cellWithImage} onClick={() => {}} />);

    const cell = screen.getByText('테스트 맛집').closest('button');
    expect(cell).toHaveClass('relative', 'shadow-md');

    // 배경 이미지 레이어 확인
    const imageLayer = cell.querySelector('[style*="background-image"]');
    expect(imageLayer).toBeInTheDocument();
    expect(imageLayer.style.backgroundImage).toContain('food.jpg');

    // 오버레이 레이어 확인
    const overlayLayer = cell.querySelector('.bg-brand-orange\\/60');
    expect(overlayLayer).toBeInTheDocument();

    // 텍스트가 흰색이고 z-10으로 오버레이 위에 표시되는지 확인
    const textElement = screen.getByText('테스트 맛집');
    expect(textElement).toHaveClass('relative', 'z-10', 'text-white');

    // 체크마크도 표시되는지 확인
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('shows orange background when activated without image', () => {
    const activatedNoImage = {
      ...mockCell,
      is_activated: true,
      review: { id: 1 }, // 이미지 없는 리뷰
    };
    render(<BingoCell cell={activatedNoImage} onClick={() => {}} />);

    const cell = screen.getByText('테스트 맛집').closest('button');
    expect(cell).toHaveClass('bg-brand-orange', 'text-white');

    // 이미지 레이어가 없어야 함
    const imageLayer = cell.querySelector('[style*="background-image"]');
    expect(imageLayer).toBeNull();
  });
});
