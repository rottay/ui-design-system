import React, { createContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Toast } from './Toast';
import type { Toast as ToastType, ToastContextValue, ToastOptions, ToastPosition } from './types';

export const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: React.ReactNode;
  defaultPosition?: ToastPosition;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  defaultPosition = 'top-right',
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  // Generate unique ID
  const generateId = (): string => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Add toast
  const toast = useCallback(
    (options: ToastOptions): string => {
      const id = options.id || generateId();

      const newToast: ToastType = {
        id,
        type: options.type || 'info',
        title: options.title || '',
        description: options.description || '',
        duration: options.duration ?? 5000,
        closable: options.closable ?? true,
        position: options.position || defaultPosition,
        action: options.action,
        icon: options.icon,
        createdAt: Date.now(),
      };

      setToasts((prev) => {
        // Remove oldest if exceeding max
        const filtered = prev.length >= maxToasts ? prev.slice(1) : prev;
        // Remove existing toast with same ID
        const withoutDuplicate = filtered.filter((t) => t.id !== id);
        return [...withoutDuplicate, newToast];
      });

      return id;
    },
    [defaultPosition, maxToasts]
  );

  // Shorthand methods
  const success = useCallback(
    (title: string, options?: Omit<ToastOptions, 'type' | 'title'>): string => {
      return toast({ ...options, type: 'success', title });
    },
    [toast]
  );

  const error = useCallback(
    (title: string, options?: Omit<ToastOptions, 'type' | 'title'>): string => {
      return toast({ ...options, type: 'error', title });
    },
    [toast]
  );

  const warning = useCallback(
    (title: string, options?: Omit<ToastOptions, 'type' | 'title'>): string => {
      return toast({ ...options, type: 'warning', title });
    },
    [toast]
  );

  const info = useCallback(
    (title: string, options?: Omit<ToastOptions, 'type' | 'title'>): string => {
      return toast({ ...options, type: 'info', title });
    },
    [toast]
  );

  const loading = useCallback(
    (title: string, options?: Omit<ToastOptions, 'type' | 'title'>): string => {
      return toast({ ...options, type: 'loading', title, duration: 0 });
    },
    [toast]
  );

  // Dismiss specific toast
  const dismiss = useCallback((id: string): void => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Dismiss all toasts
  const dismissAll = useCallback((): void => {
    setToasts([]);
  }, []);

  const contextValue: ToastContextValue = {
    toasts,
    toast,
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    dismissAll,
  };

  // Group toasts by position
  const toastsByPosition: Record<ToastPosition, ToastType[]> = {
    'top-left': [],
    'top-center': [],
    'top-right': [],
    'bottom-left': [],
    'bottom-center': [],
    'bottom-right': [],
  };

  toasts.forEach((t) => {
    toastsByPosition[t.position].push(t);
  });

  // Get container styles for each position
  const getContainerStyles = (position: ToastPosition): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      pointerEvents: 'none',
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyles, top: 24, left: 24 };
      case 'top-center':
        return { ...baseStyles, top: 24, left: '50%', transform: 'translateX(-50%)' };
      case 'top-right':
        return { ...baseStyles, top: 24, right: 24 };
      case 'bottom-left':
        return { ...baseStyles, bottom: 24, left: 24, flexDirection: 'column-reverse' };
      case 'bottom-center':
        return {
          ...baseStyles,
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          flexDirection: 'column-reverse',
        };
      case 'bottom-right':
        return { ...baseStyles, bottom: 24, right: 24, flexDirection: 'column-reverse' };
      default:
        return baseStyles;
    }
  };

  // Render toast containers
  const renderToasts = () => {
    if (typeof document === 'undefined') return null;

    return (
      <>
        {(Object.keys(toastsByPosition) as ToastPosition[]).map((position) => {
          const positionToasts = toastsByPosition[position];
          if (positionToasts.length === 0) return null;

          return createPortal(
            <div key={position} style={getContainerStyles(position)}>
              {positionToasts.map((t) => (
                <div key={t.id} style={{ pointerEvents: 'auto' }}>
                  <Toast toast={t} onDismiss={dismiss} />
                </div>
              ))}
            </div>,
            document.body
          );
        })}
      </>
    );
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {renderToasts()}
    </ToastContext.Provider>
  );
};

ToastProvider.displayName = 'ToastProvider';
