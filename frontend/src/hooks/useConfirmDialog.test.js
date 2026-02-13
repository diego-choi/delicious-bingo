import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConfirmDialog } from './useConfirmDialog';

describe('useConfirmDialog', () => {
  it('should start with dialog closed', () => {
    const { result } = renderHook(() => useConfirmDialog());
    expect(result.current.isOpen).toBe(false);
  });

  it('should open dialog when confirm is called', async () => {
    const { result } = renderHook(() => useConfirmDialog());

    act(() => {
      result.current.confirm({ title: '삭제', message: '정말 삭제하시겠습니까?' });
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.title).toBe('삭제');
    expect(result.current.message).toBe('정말 삭제하시겠습니까?');
  });

  it('should resolve true when onConfirm is called', async () => {
    const { result } = renderHook(() => useConfirmDialog());

    let resolved;
    act(() => {
      result.current.confirm({ title: '삭제', message: '확인' }).then((v) => {
        resolved = v;
      });
    });

    await act(async () => {
      result.current.onConfirm();
    });

    expect(resolved).toBe(true);
    expect(result.current.isOpen).toBe(false);
  });

  it('should resolve false when onCancel is called', async () => {
    const { result } = renderHook(() => useConfirmDialog());

    let resolved;
    act(() => {
      result.current.confirm({ title: '삭제', message: '확인' }).then((v) => {
        resolved = v;
      });
    });

    await act(async () => {
      result.current.onCancel();
    });

    expect(resolved).toBe(false);
    expect(result.current.isOpen).toBe(false);
  });

  it('should resolve previous promise as false when confirm is called again', async () => {
    const { result } = renderHook(() => useConfirmDialog());

    let firstResolved;
    let secondResolved;

    act(() => {
      result.current.confirm({ title: '첫 번째', message: '1' }).then((v) => {
        firstResolved = v;
      });
    });

    await act(async () => {
      result.current.confirm({ title: '두 번째', message: '2' }).then((v) => {
        secondResolved = v;
      });
    });

    // 첫 번째 Promise는 false로 해소되어야 함
    expect(firstResolved).toBe(false);
    // 두 번째 다이얼로그가 열려있어야 함
    expect(result.current.title).toBe('두 번째');

    await act(async () => {
      result.current.onConfirm();
    });

    expect(secondResolved).toBe(true);
  });

  it('should pass variant through', () => {
    const { result } = renderHook(() => useConfirmDialog());

    act(() => {
      result.current.confirm({ title: '삭제', message: '위험', variant: 'danger' });
    });

    expect(result.current.variant).toBe('danger');
  });
});
