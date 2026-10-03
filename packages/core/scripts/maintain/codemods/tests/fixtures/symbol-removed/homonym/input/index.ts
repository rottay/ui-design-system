import { TONE_TO_TAG_VARIANT, serializeBrandTheme } from './local';
import { TONE_TO_BADGE_VARIANT } from '@rottay/design-system-extras';
import * as Other from 'another-kit';

const BrandTheme = { name: 'local' };

export const value = TONE_TO_TAG_VARIANT.success + serializeBrandTheme(BrandTheme) + TONE_TO_BADGE_VARIANT.info;
export const other = Other.TONE_TO_AVATAR_VARIANT;
