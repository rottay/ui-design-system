/** The lab stamps through the one root stamp; the name stays so the ground's call site is unchanged. */
export { buildRootStampScript as buildLabRootStampScript } from '@/components/probe-ground/stamp/index.mjs';

/** The attribute bag the DS's `resolveDocumentRootAttributes` produces. */
export type LabRootAttributes = Readonly<Record<string, string>>;

/**
 * Capture-time judging transforms.
 *
 * R1 requires proving three-second tenant recognition in grayscale and after
 * temporary primary-hue neutralization. Both are applied identically to both
 * grounds and are NEVER on by default — a judged capture and a normal capture
 * must be distinguishable in the receipt, so the mode travels in the URL.
 */
export type JudgeMode = 'none' | 'grayscale' | 'hue-neutral';

export function isJudgeMode(value: string | null | undefined): value is JudgeMode {
  return value === 'grayscale' || value === 'hue-neutral' || value === 'none';
}

/**
 * Grayscale is a filter on the whole document. Hue neutralization is NOT a
 * filter: it rewrites the tenant's primary family to a neutral of the same
 * lightness, so everything that is not hue — geometry, weight, rhythm, rule,
 * depth — has to carry recognition on its own. That is the harder test and the
 * one the round actually asks for.
 */
export function judgeModeStyle(mode: JudgeMode): string {
  if (mode === 'grayscale') {
    return ':root{filter:grayscale(1) !important;}';
  }
  if (mode === 'hue-neutral') {
    return [
      ':root{',
      '--ds-color-primary:#6E6E6E !important;',
      '--ds-color-primary-hover:#5C5C5C !important;',
      '--ds-color-primary-active:#4A4A4A !important;',
      '--ds-color-secondary:#7A7A7A !important;',
      '--ds-color-accent:#666666 !important;',
      '}',
    ].join('');
  }
  return '';
}
