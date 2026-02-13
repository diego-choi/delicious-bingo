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

  it('should pass variant through', () => {
    const { result } = renderHook(() => useConfirmDialog());

    act(() => {
      result.current.confirm({ title: '삭제', message: '위험', variant: 'danger' });
    });

    expect(result.current.variant).toBe('danger');
  });
});
