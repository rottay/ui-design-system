import type {
  CloudOpticalVariant,
  MarkSize,
} from '../../../foundation/catalog';

const TOKEN_PIXEL_SIZES: Readonly<Record<Exclude<MarkSize, number>, number>> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

/** Picks the purpose-drawn AWS tier whose exported canvas best fits the visual size. */
export function resolveCloudOpticalVariant(size: unknown): CloudOpticalVariant {
  const pixels = typeof size === 'number'
    ? (Number.isFinite(size) && size > 0 ? size : TOKEN_PIXEL_SIZES.md)
    : TOKEN_PIXEL_SIZES[size as keyof typeof TOKEN_PIXEL_SIZES] ?? TOKEN_PIXEL_SIZES.md;

  if (pixels <= 24) return '16';
  if (pixels <= 40) return '32';
  if (pixels <= 64) return 'default';
  return '64';
}
