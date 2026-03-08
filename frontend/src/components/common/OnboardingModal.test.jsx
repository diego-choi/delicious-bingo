import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OnboardingModal from './OnboardingModal';

function renderModal(props = {}) {
  return render(
    <OnboardingModal isOpen={true} onClose={vi.fn()} onStart={vi.fn()} {...props} />
  );
}

describe('OnboardingModal', () => {
  it('should not render when isOpen is false', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render first step by default', () => {
    renderModal();
    expect(screen.getByText('빙고 템플릿을 선택하세요')).toBeInTheDocument();
    expect(screen.getByText('다음')).toBeInTheDocument();
  });

  it('should advance to next step when clicking 다음', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText('다음'));
    expect(screen.getByText(/맛집 방문/)).toBeInTheDocument();
  });

  it('should go back to previous step when clicking 이전', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText('다음'));
    await user.click(screen.getByText('이전'));
    expect(screen.getByText('빙고 템플릿을 선택하세요')).toBeInTheDocument();
  });

  it('should show 시작하기 button on last step', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText('다음'));
    await user.click(screen.getByText('다음'));
    expect(screen.getByText('시작하기')).toBeInTheDocument();
  });

  it('should call onClose before onStart when clicking 시작하기', async () => {
    const user = userEvent.setup();
    const callOrder = [];
    const onClose = vi.fn(() => callOrder.push('close'));
    const onStart = vi.fn(() => callOrder.push('start'));
    renderModal({ onClose, onStart });

    await user.click(screen.getByText('다음'));
    await user.click(screen.getByText('다음'));
    await user.click(screen.getByText('시작하기'));

    expect(onClose).toHaveBeenCalled();
    expect(onStart).toHaveBeenCalled();
    expect(callOrder).toEqual(['close', 'start']);
  });

  it('should call onClose when clicking 건너뛰기', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({ onClose });

    await user.click(screen.getByText('건너뛰기'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when clicking backdrop', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({ onClose });

    const backdrop = screen.getByTestId('onboarding-backdrop');
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when pressing ESC', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({ onClose });

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('should reset to first step when reopened', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <OnboardingModal isOpen={true} onClose={vi.fn()} onStart={vi.fn()} />
    );
    await user.click(screen.getByText('다음'));
    expect(screen.getByText(/맛집 방문/)).toBeInTheDocument();

    rerender(<OnboardingModal isOpen={false} onClose={vi.fn()} onStart={vi.fn()} />);
    rerender(<OnboardingModal isOpen={true} onClose={vi.fn()} onStart={vi.fn()} />);
    expect(screen.getByText('빙고 템플릿을 선택하세요')).toBeInTheDocument();
  });

  it('should show step indicators', () => {
    renderModal();
    const indicators = screen.getAllByTestId('step-indicator');
    expect(indicators).toHaveLength(3);
  });

  describe('접근성', () => {
    it('should have role="dialog" and aria-modal="true"', () => {
      renderModal();
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should focus first button when opened', () => {
      renderModal();
      expect(document.activeElement).toBe(screen.getByText('건너뛰기'));
    });

    it('should have aria-labelledby pointing to title', () => {
      renderModal();
      const dialog = screen.getByRole('dialog');
      const titleId = dialog.getAttribute('aria-labelledby');
      const title = document.getElementById(titleId);
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('빙고 템플릿을 선택하세요');
    });

    it('should lock body scroll when open', () => {
      renderModal();
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when closed', () => {
      const { rerender } = render(
        <OnboardingModal isOpen={true} onClose={vi.fn()} onStart={vi.fn()} />
      );
      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <OnboardingModal isOpen={false} onClose={vi.fn()} onStart={vi.fn()} />
      );
      expect(document.body.style.overflow).toBe('');
    });

    it('should trap focus: Tab from last button moves to first button', async () => {
      const user = userEvent.setup();
      renderModal();

      const skipBtn = screen.getByText('건너뛰기');
      const nextBtn = screen.getByText('다음');

      nextBtn.focus();
      await user.tab();
      expect(document.activeElement).toBe(skipBtn);
    });

    it('should trap focus: Shift+Tab from first button moves to last button', async () => {
      const user = userEvent.setup();
      renderModal();

      const skipBtn = screen.getByText('건너뛰기');
      const nextBtn = screen.getByText('다음');

      skipBtn.focus();
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(nextBtn);
    });

    it('should have aria-hidden on backdrop', () => {
      renderModal();
      const backdrop = screen.getByTestId('onboarding-backdrop');
      expect(backdrop).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have aria-describedby pointing to description', () => {
      renderModal();
      const dialog = screen.getByRole('dialog');
      const descId = dialog.getAttribute('aria-describedby');
      const desc = document.getElementById(descId);
      expect(desc).toBeInTheDocument();
    });

    it('should restore body scroll when unmounted while open', () => {
      const { unmount } = renderModal();
      expect(document.body.style.overflow).toBe('hidden');

      unmount();
      expect(document.body.style.overflow).toBe('');
    });

    it('should restore focus when unmounted while open', () => {
      const button = document.createElement('button');
      button.textContent = 'trigger';
      document.body.appendChild(button);
      button.focus();

      const { unmount } = renderModal();

      unmount();
      expect(document.activeElement).toBe(button);

      document.body.removeChild(button);
    });
  });
});
