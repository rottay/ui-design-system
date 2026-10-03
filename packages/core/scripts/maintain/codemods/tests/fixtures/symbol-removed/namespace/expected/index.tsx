import * as DS from '@rottay/design-system';

export const key = DS.TONE_TO_VARIANT.info;
export const viaElement = DS['serializeFlatTheme'];
export type Flat = DS.FlatTheme;
export type Query = import('@rottay/design-system').FlatThemeMode;

const { TONE_TO_TAG_VARIANT } = DS;
export const destructured = TONE_TO_TAG_VARIANT;

export function shadowed(DS: { TONE_TO_AVATAR_VARIANT: string }) {
  return DS.TONE_TO_AVATAR_VARIANT;
}
