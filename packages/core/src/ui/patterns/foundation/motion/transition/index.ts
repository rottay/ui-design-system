/** Shared pattern transition timing derived exclusively from DS motion tokens. */
export const PATTERN_MOTION_FAST = 'var(--ds-motion-fast, 120ms)';
export const PATTERN_EASE_OUT = 'var(--ds-motion-ease-out, cubic-bezier(0.16, 1, 0.3, 1))';
export const PATTERN_TRANSITION = `${PATTERN_MOTION_FAST} ${PATTERN_EASE_OUT}`;
