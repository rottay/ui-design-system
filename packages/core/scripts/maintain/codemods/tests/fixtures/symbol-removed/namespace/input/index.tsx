import * as DS from '@rottay/design-system';

export const key = DS.TONE_TO_AVATAR_VARIANT.info;
export const viaElement = DS['serializeBrandTheme'];
export type Flat = DS.BrandTheme;
export type Query = import('@rottay/design-system').BrandThemeMode;

const { TONE_TO_TAG_VARIANT } = DS;
export const destructured = TONE_TO_TAG_VARIANT;

export function shadowed(DS: { TONE_TO_AVATAR_VARIANT: string }) {
  return DS.TONE_TO_AVATAR_VARIANT;
}
