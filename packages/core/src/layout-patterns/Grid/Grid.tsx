import React from 'react';
import type { GridProps } from './types';

/**
 * Grid component
 * Responsive grid layout with automatic columns
 */
export const Grid: React.FC<GridProps> = ({
  children,
  columns = 1,
  gap = 'md',
  rowGap,
  columnGap,
  minChildWidth,
  autoFlow,
  className,
  style,
  ...rest
}) => {
  const gaps = {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  };

  const getGapValue = (gapValue: typeof gap) => {
    if (typeof gapValue === 'number') return `${gapValue}px`;
    return gaps[gapValue];
  };

  // Handle responsive columns
  const getTemplateColumns = () => {
    if (minChildWidth) {
      return `repeat(auto-fit, minmax(${minChildWidth}, 1fr))`;
    }

    if (typeof columns === 'number') {
      return `repeat(${columns}, 1fr)`;
    }

    // Responsive columns object
    if (typeof columns === 'object') {
      // Default to mobile first
      return `repeat(${columns.mobile || 1}, 1fr)`;
    }

    return columns; // String template
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: getTemplateColumns(),
    gap: getGapValue(gap),
    rowGap: rowGap ? getGapValue(rowGap) : undefined,
    columnGap: columnGap ? getGapValue(columnGap) : undefined,
    gridAutoFlow: autoFlow,
    ...style,
  };

  // Add responsive styles for columns object
  if (typeof columns === 'object') {
    const responsiveStyle = document.createElement('style');
    const uniqueId = `grid-${Math.random().toString(36).substr(2, 9)}`;

    let css = '';
    if (columns.tablet) {
      css += `@media (min-width: 768px) { .${uniqueId} { grid-template-columns: repeat(${columns.tablet}, 1fr); } }`;
    }
    if (columns.desktop) {
      css += `@media (min-width: 1024px) { .${uniqueId} { grid-template-columns: repeat(${columns.desktop}, 1fr); } }`;
    }

    if (css && typeof document !== 'undefined') {
      responsiveStyle.textContent = css;
      document.head.appendChild(responsiveStyle);
    }

    return (
      <div className={`${className || ''} ${uniqueId}`} style={gridStyle} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <div className={className} style={gridStyle} {...rest}>
      {children}
    </div>
  );
};

Grid.displayName = 'Grid';
