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

  describe('접근성', () => {
    it('should have role="dialog" and aria-modal="true"', () => {
      render(<ConfirmDialog {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby pointing to title', () => {
      render(<ConfirmDialog {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      const titleId = dialog.getAttribute('aria-labelledby');
      const title = document.getElementById(titleId);
      expect(title).toHaveTextContent('삭제 확인');
    });

    it('should have aria-describedby pointing to message', () => {
      render(<ConfirmDialog {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      const messageId = dialog.getAttribute('aria-describedby');
      const message = document.getElementById(messageId);
      expect(message).toHaveTextContent('정말 삭제하시겠습니까?');
    });

    it('should call onCancel when ESC key is pressed', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);

      await user.keyboard('{Escape}');
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should focus cancel button when opened', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(document.activeElement).toBe(screen.getByText('취소'));
    });

    it('should restore focus to previously focused element when closed', () => {
      const button = document.createElement('button');
      button.textContent = 'trigger';
      document.body.appendChild(button);
      button.focus();

      const { rerender } = render(<ConfirmDialog {...defaultProps} />);
      expect(document.activeElement).toBe(screen.getByText('취소'));

      rerender(<ConfirmDialog {...defaultProps} isOpen={false} />);
      expect(document.activeElement).toBe(button);

      document.body.removeChild(button);
    });

    it('should trap focus: Tab from last button moves to first button', async () => {
      const user = userEvent.setup();
      render(<ConfirmDialog {...defaultProps} />);

      const cancelBtn = screen.getByText('취소');
      const confirmBtn = screen.getByText('확인');

      confirmBtn.focus();
      await user.tab();
      expect(document.activeElement).toBe(cancelBtn);
    });

    it('should trap focus: Shift+Tab from first button moves to last button', async () => {
      const user = userEvent.setup();
      render(<ConfirmDialog {...defaultProps} />);

      const cancelBtn = screen.getByText('취소');
      const confirmBtn = screen.getByText('확인');

      cancelBtn.focus();
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(confirmBtn);
    });
  });
});
