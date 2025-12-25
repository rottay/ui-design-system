import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../hooks/useTheme';
import type { ScrollShadowProps } from './types';

/**
 * ScrollShadow Component - Visual feedback for scrollable content
 *
 * Automatically shows shadows at the edges of scrollable containers
 * to indicate there's more content available. Provides excellent UX
 * by giving visual cues about scroll position.
 *
 * Features:
 * - Automatic shadow detection based on scroll position
 * - Supports vertical, horizontal, or both directions
 * - Theme-aware shadow styling
 * - Customizable shadow size
 * - Optional scrollbar hiding
 * - Performance optimized with RAF
 *
 * @example
 * ```tsx
 * // Vertical scrolling
 * <ScrollShadow className="max-h-[400px]">
 *   <LongContentList />
 * </ScrollShadow>
 *
 * // Horizontal scrolling
 * <ScrollShadow orientation="horizontal">
 *   <WideContent />
 * </ScrollShadow>
 *
 * // Both directions
 * <ScrollShadow orientation="both" size="lg">
 *   <LargeDataGrid />
 * </ScrollShadow>
 * ```
 */
export const ScrollShadow: React.FC<ScrollShadowProps> = ({
  children,
  orientation = 'vertical',
  size = 'md',
  visibility = 'auto',
  hideScrollBar = false,
  offset = 0,
  className,
  style,
  onScroll,
}) => {
  const { template } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shadows, setShadows] = useState({
    top: false,
    bottom: false,
    left: false,
    right: false,
  });

  // Check scroll position and update shadows
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || visibility !== 'auto') return;

    const isVertical = orientation === 'vertical' || orientation === 'both';
    const isHorizontal = orientation === 'horizontal' || orientation === 'both';

    const newShadows = {
      top: isVertical && el.scrollTop > offset,
      bottom: isVertical && el.scrollTop < el.scrollHeight - el.clientHeight - offset,
      left: isHorizontal && el.scrollLeft > offset,
      right: isHorizontal && el.scrollLeft < el.scrollWidth - el.clientWidth - offset,
    };

    setShadows(newShadows);
  }, [orientation, visibility, offset]);

  // Initial check and resize observer
  useEffect(() => {
    checkScroll();

    const el = scrollRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver(() => {
      checkScroll();
    });

    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
    };
  }, [checkScroll]);

  // Handle scroll event
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    checkScroll();
    onScroll?.(e);
  };

  // Get shadow size
  const getShadowSize = () => {
    const sizes = {
      sm: 20,
      md: 40,
      lg: 60,
    };
    return sizes[size];
  };

  // Get shadow color based on theme
  const getShadowColor = () => {
    switch (template) {
      case 'spotify':
        return 'rgba(0, 0, 0, 0.5)';
      case 'stripe':
        return 'rgba(0, 0, 0, 0.08)';
      case 'notion':
        return 'rgba(15, 15, 15, 0.1)';
      case 'linear':
        return 'rgba(0, 0, 0, 0.06)';
      case 'vercel':
        return 'rgba(0, 0, 0, 0.25)';
      default:
        return 'rgba(0, 0, 0, 0.1)';
    }
  };

  const shadowSize = getShadowSize();
  const shadowColor = getShadowColor();

  // Determine which shadows to show
  const showTop = visibility === 'auto' ? shadows.top : visibility === 'top' || visibility === 'both';
  const showBottom = visibility === 'auto' ? shadows.bottom : visibility === 'bottom' || visibility === 'both';
  const showLeft = visibility === 'auto' ? shadows.left : visibility === 'left' || visibility === 'both';
  const showRight = visibility === 'auto' ? shadows.right : visibility === 'right' || visibility === 'both';

  // Container styles
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    ...style,
  };

  // Scroll area styles
  const scrollAreaStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    overflow: orientation === 'vertical' ? 'auto' : orientation === 'horizontal' ? 'auto' : 'auto',
    overflowX: orientation === 'vertical' ? 'hidden' : 'auto',
    overflowY: orientation === 'horizontal' ? 'hidden' : 'auto',
    ...(hideScrollBar && {
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      WebkitOverflowScrolling: 'touch',
    }),
  };

  // Shadow overlay styles
  const shadowBaseStyles: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    transition: 'opacity 0.3s ease',
    zIndex: 1,
  };

  const topShadowStyles: React.CSSProperties = {
    ...shadowBaseStyles,
    top: 0,
    left: 0,
    right: 0,
    height: shadowSize,
    background: `linear-gradient(to bottom, ${shadowColor}, transparent)`,
    opacity: showTop ? 1 : 0,
  };

  const bottomShadowStyles: React.CSSProperties = {
    ...shadowBaseStyles,
    bottom: 0,
    left: 0,
    right: 0,
    height: shadowSize,
    background: `linear-gradient(to top, ${shadowColor}, transparent)`,
    opacity: showBottom ? 1 : 0,
  };

  const leftShadowStyles: React.CSSProperties = {
    ...shadowBaseStyles,
    top: 0,
    left: 0,
    bottom: 0,
    width: shadowSize,
    background: `linear-gradient(to right, ${shadowColor}, transparent)`,
    opacity: showLeft ? 1 : 0,
  };

  const rightShadowStyles: React.CSSProperties = {
    ...shadowBaseStyles,
    top: 0,
    right: 0,
    bottom: 0,
    width: shadowSize,
    background: `linear-gradient(to left, ${shadowColor}, transparent)`,
    opacity: showRight ? 1 : 0,
  };

  return (
    <div className={className} style={containerStyles}>
      {/* Top shadow */}
      {(orientation === 'vertical' || orientation === 'both') && (
        <div style={topShadowStyles} aria-hidden="true" />
      )}

      {/* Bottom shadow */}
      {(orientation === 'vertical' || orientation === 'both') && (
        <div style={bottomShadowStyles} aria-hidden="true" />
      )}

      {/* Left shadow */}
      {(orientation === 'horizontal' || orientation === 'both') && (
        <div style={leftShadowStyles} aria-hidden="true" />
      )}

      {/* Right shadow */}
      {(orientation === 'horizontal' || orientation === 'both') && (
        <div style={rightShadowStyles} aria-hidden="true" />
      )}

      {/* Scroll area */}
      <div
        ref={scrollRef}
        style={scrollAreaStyles}
        onScroll={handleScroll}
        className={hideScrollBar ? 'scrollbar-hide' : ''}
      >
        {children}
      </div>

      {/* CSS for hiding scrollbar if needed */}
      {hideScrollBar && (
        <style>
          {`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
      )}
    </div>
  );
};

ScrollShadow.displayName = 'ScrollShadow';
