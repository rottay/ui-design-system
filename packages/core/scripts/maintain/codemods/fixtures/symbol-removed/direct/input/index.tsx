import { Tag, TONE_TO_TAG_VARIANT } from '@rottay/design-system';

// TONE_TO_TAG_VARIANT is mentioned in this comment and must stay.
const label = 'TONE_TO_TAG_VARIANT';

export function toneKey(tone: keyof typeof TONE_TO_TAG_VARIANT) {
  return TONE_TO_TAG_VARIANT[tone];
}

export function shadowed(TONE_TO_TAG_VARIANT: Record<string, string>) {
  return TONE_TO_TAG_VARIANT.success;
}

export const table = { TONE_TO_TAG_VARIANT, label, other: { TONE_TO_TAG_VARIANT: 1 } };

export { TONE_TO_TAG_VARIANT };

export const element = <Tag tone="success">{`TONE_TO_TAG_VARIANT`}</Tag>;
