import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from './ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    title: '삭제 확인',
    message: '정말 삭제하시겠습니까?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('should not render when isOpen is false', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('삭제 확인')).not.toBeInTheDocument();
  });

  it('should render title and message when open', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('삭제 확인')).toBeInTheDocument();
    expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);

    await user.click(screen.getByText('확인'));
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);

    await user.click(screen.getByText('취소'));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('should call onCancel when backdrop is clicked', async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);

    const backdrop = screen.getByTestId('confirm-backdrop');
    await user.click(backdrop);
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('should show custom button text', () => {
    render(<ConfirmDialog {...defaultProps} confirmText="삭제" cancelText="돌아가기" />);
    expect(screen.getByText('삭제')).toBeInTheDocument();
    expect(screen.getByText('돌아가기')).toBeInTheDocument();
  });

  it('should apply danger variant style to confirm button', () => {
    render(<ConfirmDialog {...defaultProps} variant="danger" confirmText="삭제" />);
    const confirmBtn = screen.getByText('삭제');
    expect(confirmBtn.className).toContain('bg-red');
  });
});
