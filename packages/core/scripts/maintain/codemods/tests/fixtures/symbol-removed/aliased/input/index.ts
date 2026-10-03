import { TONE_TO_BADGE_VARIANT as badgeMap, TONE_TO_AVATAR_VARIANT as TONE_TO_VARIANT } from '@rottay/design-system';
import type { BrandTheme as Theme } from '@rottay/design-system';

export const success = badgeMap.success + TONE_TO_VARIANT.info;
export type Draft = Partial<Theme>;
