/**
 * Timeline Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Timeline CSS custom properties.
 * Use these for type-safe Timeline token references.
 */

// Timeline element sizes
export const timelineSize = {
  dotSize: 'var(--timeline-dot-size)',
  dotBorderWidth: 'var(--timeline-dot-border-width)',
  lineWidth: 'var(--timeline-line-width)',
  itemPadding: 'var(--timeline-item-padding)',
  dotOffset: 'var(--timeline-dot-offset)',
} as const;

// Timeline colors
export const timelineColor = {
  blue: 'var(--timeline-color-blue)',
  red: 'var(--timeline-color-red)',
  green: 'var(--timeline-color-green)',
  gray: 'var(--timeline-color-gray)',
  primary: 'var(--timeline-color-primary)',
  success: 'var(--timeline-color-success)',
  warning: 'var(--timeline-color-warning)',
  error: 'var(--timeline-color-error)',
  line: 'var(--timeline-line-color)',
} as const;

// Timeline content styling
export const timelineContent = {
  fontSize: 'var(--timeline-content-font-size)',
  lineHeight: 'var(--timeline-content-line-height)',
  color: 'var(--timeline-content-color)',
} as const;

// Timeline label styling
export const timelineLabel = {
  fontSize: 'var(--timeline-label-font-size)',
  color: 'var(--timeline-label-color)',
} as const;

// Timeline pending state
export const timelinePending = {
  dotColor: 'var(--timeline-pending-dot-color)',
  animation: 'var(--timeline-pending-animation)',
} as const;

// Timeline transitions
export const timelineTransition = {
  duration: 'var(--timeline-transition-duration)',
  timing: 'var(--timeline-transition-timing)',
} as const;

// Combined timeline tokens
export const timelineTokens = {
  size: timelineSize,
  color: timelineColor,
  content: timelineContent,
  label: timelineLabel,
  pending: timelinePending,
  transition: timelineTransition,
} as const;

// Type exports
export type TimelineColor = keyof Omit<typeof timelineColor, 'line'>;
