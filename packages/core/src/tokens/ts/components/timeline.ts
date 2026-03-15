/**
 * Timeline Component Tokens - TypeScript Mirror
 *
 * TypeScript representation of Timeline CSS custom properties.
 * Use these for type-safe Timeline token references.
 */

// Timeline element sizes
export const timelineSize = {
  dotSize: 'var(--ds-timeline-dot-size)',
  dotBorderWidth: 'var(--ds-timeline-dot-border-width)',
  lineWidth: 'var(--ds-timeline-line-width)',
  itemPadding: 'var(--ds-timeline-item-padding)',
  dotOffset: 'var(--ds-timeline-dot-offset)',
} as const;

// Timeline colors
export const timelineColor = {
  blue: 'var(--ds-timeline-color-blue)',
  red: 'var(--ds-timeline-color-red)',
  green: 'var(--ds-timeline-color-green)',
  gray: 'var(--ds-timeline-color-gray)',
  primary: 'var(--ds-timeline-color-primary)',
  success: 'var(--ds-timeline-color-success)',
  warning: 'var(--ds-timeline-color-warning)',
  error: 'var(--ds-timeline-color-error)',
  line: 'var(--ds-timeline-line-color)',
} as const;

// Timeline content styling
export const timelineContent = {
  fontSize: 'var(--ds-timeline-content-font-size)',
  lineHeight: 'var(--ds-timeline-content-line-height)',
  color: 'var(--ds-timeline-content-color)',
} as const;

// Timeline label styling
export const timelineLabel = {
  fontSize: 'var(--ds-timeline-label-font-size)',
  color: 'var(--ds-timeline-label-color)',
} as const;

// Timeline pending state
export const timelinePending = {
  dotColor: 'var(--ds-timeline-pending-dot-color)',
  animation: 'var(--ds-timeline-pending-animation)',
} as const;

// Timeline transitions
export const timelineTransition = {
  duration: 'var(--ds-timeline-transition-duration)',
  timing: 'var(--ds-timeline-transition-timing)',
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
