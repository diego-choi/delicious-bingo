import { useState, useCallback, useRef } from 'react';

export function useConfirmDialog() {
  const [state, setState] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'default',
    confirmText: '확인',
    cancelText: '취소',
  });
  const resolveRef = useRef(null);

  const confirm = useCallback(({ title, message, variant = 'default', confirmText = '확인', cancelText = '취소' }) => {
    setState({ isOpen: true, title, message, variant, confirmText, cancelText });
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const onConfirm = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
    resolveRef.current?.(true);
    resolveRef.current = null;
  }, []);

  const onCancel = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
    resolveRef.current?.(false);
    resolveRef.current = null;
  }, []);

  return {
    ...state,
    confirm,
    onConfirm,
    onCancel,
  };
}
