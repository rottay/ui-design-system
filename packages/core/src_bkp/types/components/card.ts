import React from 'react';

/**
 * Base props for Card components
 * These props are supported by ALL engines (titan/AntD, hermes/DaisyUI, apollo/HTML+Tailwind)
 */
export interface CardBaseProps {
  /** Card title */
  title?: React.ReactNode;

  /** Card content */
  children?: React.ReactNode;

  /** Additional CSS class name */
  className?: string;

  /** Click handler for the card */
  onClick?: () => void;
}

/**
 * Extended props for Card components
 * Includes engine-specific props that may not be supported by all implementations
 */
export interface CardProps extends CardBaseProps {
  /** Card header content (alternative to title) */
  header?: React.ReactNode;

  /** Card footer content */
  footer?: React.ReactNode;

  /** Extra actions to display in header (usually top-right) */
  extra?: React.ReactNode;

  /** Card cover image or media */
  cover?: React.ReactNode;

  /** Whether the card has a border */
  bordered?: boolean;

  /** Whether the card content has padding */
  bodyPadding?: boolean;

  /** Whether the card has hover effect */
  hoverable?: boolean;

  /** Loading state */
  loading?: boolean;

  /** Size variant */
  size?: 'small' | 'medium' | 'large';

  /** Card type/variant */
  variant?: 'default' | 'outlined' | 'filled' | 'elevated';

  /** Custom styles for card body */
  bodyStyle?: React.CSSProperties;

  /** Custom styles for card header */
  headerStyle?: React.CSSProperties;
}

/**
 * Props for Card.Meta (metadata section within a card)
 */
export interface CardMetaProps {
  /** Avatar to display */
  avatar?: React.ReactNode;

  /** Title text */
  title?: React.ReactNode;

  /** Description text */
  description?: React.ReactNode;

  /** Additional CSS class name */
  className?: string;
}

/**
 * Props for Card.Grid (grid item within a card)
 */
export interface CardGridProps {
  /** Grid item content */
  children?: React.ReactNode;

  /** Whether the grid item has hover effect */
  hoverable?: boolean;

  /** Additional CSS class name */
  className?: string;

  /** Click handler */
  onClick?: () => void;
}
