import type {
  FeaturePictogramSize,
  FeaturePictogramTone,
} from '../../foundation/catalog';

const SIZE_TOKENS = { sm: 32, md: 48, lg: 64, xl: 96 } as const;
const TONES: ReadonlySet<string> = new Set([
  'brand',
  'neutral',
  'success',
  'warning',
  'danger',
  'ai',
]);
const warnedInputs = new Set<string>();

export function warnFeaturePictogramOnce(key: string, message: string): void {
  if (process.env.NODE_ENV === 'production' || warnedInputs.has(key)) return;
  warnedInputs.add(key);
  console.warn(`[Rottay FeaturePictogram] ${message}`);
}

export function resolveFeaturePictogramSize(size: FeaturePictogramSize): number | null {
  if (typeof size === 'string') return SIZE_TOKENS[size] ?? null;
  return Number.isFinite(size) && size >= 32 && size <= 96 ? size : null;
}

export function resolveFeaturePictogramTone(tone: unknown): FeaturePictogramTone {
  return typeof tone === 'string' && TONES.has(tone)
    ? tone as FeaturePictogramTone
    : 'brand';
}

export function resolveFeaturePictogramAccessibility(
  key: string,
  label: unknown,
  decorative: unknown,
): { readonly label?: string } | null {
  const normalizedLabel = typeof label === 'string' ? label.trim() : '';
  const isLabeled = normalizedLabel.length > 0;
  const isDecorative = decorative === true;

  if (isLabeled === isDecorative) {
    warnFeaturePictogramOnce(
      `a11y:${key}:${String(label)}:${String(decorative)}`,
      `Pictogram "${key}" must have either a non-empty label or decorative={true}; rendered null.`,
    );
    return null;
  }

  return isLabeled ? { label: normalizedLabel } : {};
}
