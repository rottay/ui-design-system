import { TONE_TO_VARIANT as badgeMap, TONE_TO_VARIANT } from '@rottay/design-system';
import type { FlatTheme as Theme } from '@rottay/design-system';

export const success = badgeMap.success + TONE_TO_VARIANT.info;
export type Draft = Partial<Theme>;
