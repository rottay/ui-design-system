interface ShowroomSurfaceTokens {
  canvas: string;
  surface: string;
  subtle: string;
  border: string;
  borderStrong: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  shadow: string;
  shadowStrong: string;
}

export const SHOWROOM_SURFACES: ShowroomSurfaceTokens = {
  canvas:
    'var(--showroom-shell-canvas, color-mix(in srgb, var(--ds-color-bg-secondary, var(--ds-color-bg-primary, #ffffff)) 92%, var(--ds-color-primary, #ffffff) 8%))',
  surface:
    'var(--showroom-shell-surface, color-mix(in srgb, var(--ds-color-bg-elevated, var(--ds-color-bg-primary, #ffffff)) 84%, var(--ds-color-bg-primary, #ffffff) 16%))',
  subtle:
    'var(--showroom-shell-surface-subtle, color-mix(in srgb, var(--ds-color-bg-elevated, var(--ds-color-bg-primary, #ffffff)) 72%, var(--ds-color-primary, #ffffff) 12%))',
  border:
    'var(--showroom-shell-border, color-mix(in srgb, var(--ds-color-border-subtle, var(--ds-color-border, rgba(148, 163, 184, 0.22))) 86%, transparent))',
  borderStrong:
    'var(--showroom-shell-border-strong, color-mix(in srgb, var(--ds-color-border, rgba(148, 163, 184, 0.32)) 92%, var(--ds-color-primary, #ffffff) 8%))',
  text:
    'var(--showroom-shell-text, var(--ds-color-text-primary, #101418))',
  textSecondary:
    'var(--showroom-shell-text-secondary, var(--ds-color-text-secondary, #5b6677))',
  textTertiary:
    'var(--showroom-shell-text-tertiary, var(--ds-color-text-muted, #7d8797))',
  shadow:
    'var(--showroom-shell-shadow, var(--ds-shadow-md, 0 14px 32px rgba(15, 23, 42, 0.08)))',
  shadowStrong:
    'var(--showroom-shell-shadow-strong, var(--ds-shadow-lg, 0 24px 48px rgba(15, 23, 42, 0.14)))',
};

export function mixWithSurface(
  color: string,
  amount = 12,
  base: string = SHOWROOM_SURFACES.surface,
) {
  return `color-mix(in srgb, ${color} ${amount}%, ${base})`;
}

export function mixWithCanvas(
  color: string,
  amount = 12,
  base: string = SHOWROOM_SURFACES.canvas,
) {
  return `color-mix(in srgb, ${color} ${amount}%, ${base})`;
}
