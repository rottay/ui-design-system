import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { theme } from 'antd';
import { BottomSheetProps } from './types';

const { useToken } = theme;

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onClose,
  children,
  snapPoints = [0.3, 0.6, 0.9],
  initialSnapPointIndex = 0,
  title,
  showDragHandle = true,
  showBackdrop = true,
  closeOnBackdropClick = true,
  dismissOnDrag = true,
  header,
  footer,
  className = '',
  style = {},
  zIndex = 1000,
  onSnapPointChange,
}) => {
  const { token } = useToken();
  const [currentSnapIndex, setCurrentSnapIndex] = useState(initialSnapPointIndex);
  const [isDragging, setIsDragging] = useState(false);
  const [currentY, setCurrentY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const currentHeightRef = useRef(0);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Calculate theme-specific styles
  const getThemeStyles = () => {
    const borderRadius = token.borderRadius || 8;
    const themeName = (token as any).themeName || 'base';

    const topBorderRadius: Record<string, number> = {
      spotify: 12,
      stripe: 8,
      notion: 3,
      linear: 16,
      airbnb: 8,
      slack: 4,
      vercel: 8,
      base: borderRadius,
    };

    return {
      borderTopLeftRadius: topBorderRadius[themeName] || borderRadius,
      borderTopRightRadius: topBorderRadius[themeName] || borderRadius,
    };
  };

  const themeStyles = getThemeStyles();

  // Calculate sheet height based on snap point
  const getSnapPointHeight = (index: number) => {
    if (typeof window === 'undefined') return 0;
    return window.innerHeight * snapPoints[index];
  };

  const currentHeight = getSnapPointHeight(currentSnapIndex);

  // Handle drag start
  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    startYRef.current = clientY;
    currentHeightRef.current = currentHeight;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  // Handle drag move
  const handleDragMove = useCallback(
    (clientY: number) => {
      if (!isDragging) return;

      const deltaY = clientY - startYRef.current;

      // Update current Y for visual feedback
      setCurrentY(deltaY);
    },
    [isDragging]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handleDragMove(e.clientY);
    },
    [handleDragMove]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      handleDragMove(e.touches[0].clientY);
    },
    [handleDragMove]
  );

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;

    const deltaY = currentY;
    const currentHeightValue = currentHeightRef.current - deltaY;

    // Determine closest snap point or dismiss
    if (dismissOnDrag && deltaY > 100 && currentSnapIndex === 0) {
      onClose();
    } else {
      let closestIndex = 0;
      let minDiff = Infinity;

      snapPoints.forEach((point, index) => {
        const snapHeight = window.innerHeight * point;
        const diff = Math.abs(snapHeight - currentHeightValue);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = index;
        }
      });

      setCurrentSnapIndex(closestIndex);
      onSnapPointChange?.(closestIndex);
    }

    setIsDragging(false);
    setCurrentY(0);
    startYRef.current = 0;
  }, [isDragging, currentY, currentSnapIndex, dismissOnDrag, onClose, snapPoints, onSnapPointChange]);

  // Add event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleDragEnd);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleTouchMove, handleDragEnd]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  // Handle backdrop click
  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  if (!mounted || !open) return null;

  const transformY = isDragging ? Math.max(0, currentY) : 0;
  const sheetHeight = currentHeight - (isDragging ? Math.min(currentY, currentHeight) : 0);

  const content = (
    <>
      {/* Backdrop */}
      {showBackdrop && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            zIndex: zIndex,
            opacity: open ? 1 : 0,
            transition: isDragging ? 'none' : 'opacity 0.3s ease',
          }}
          onClick={handleBackdropClick}
        />
      )}

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={className}
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          height: sheetHeight,
          maxHeight: '95vh',
          backgroundColor: token.colorBgContainer,
          borderTopLeftRadius: themeStyles.borderTopLeftRadius,
          borderTopRightRadius: themeStyles.borderTopRightRadius,
          boxShadow: token.boxShadowSecondary,
          zIndex: zIndex + 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transform: `translateY(${transformY}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease, height 0.3s ease',
          ...style,
        }}
      >
        {/* Header */}
        <div
          style={{
            flexShrink: 0,
            padding: token.padding,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            cursor: 'grab',
            userSelect: 'none',
            touchAction: 'none',
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {header ? (
            header
          ) : (
            <>
              {showDragHandle && (
                <div
                  style={{
                    width: 40,
                    height: 4,
                    backgroundColor: token.colorBorder,
                    borderRadius: 2,
                    margin: '0 auto 12px',
                  }}
                />
              )}
              {title && (
                <div
                  style={{
                    fontSize: token.fontSizeLG,
                    fontWeight: 600,
                    color: token.colorText,
                    textAlign: 'center',
                  }}
                >
                  {title}
                </div>
              )}
            </>
          )}
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: token.padding,
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              flexShrink: 0,
              padding: token.padding,
              borderTop: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </>
  );

  return createPortal(content, document.body);
};

BottomSheet.displayName = 'BottomSheet';
