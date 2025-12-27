/**
 * Component Tokens Index - TypeScript
 *
 * Central export file for all component-specific design tokens.
 * Import from this file to access all component tokens.
 */

// Individual component token exports
export * from './avatar';
export * from './badge';
export * from './button';
export * from './input';
export * from './card';
export * from './modal';
export * from './checkbox';
export * from './radio';
export * from './select';
export * from './tag';
export * from './toggle';
export * from './icon';
export * from './spinner';
export * from './rate';
export * from './space';
export * from './timeline';
export * from './qrcode';
export * from './list';

// Named imports for grouped exports
import { avatarTokens } from './avatar';
import { badgeTokens } from './badge';
import { buttonTokens } from './button';
import { inputTokens } from './input';
import { cardTokens } from './card';
import { modalTokens } from './modal';
import { checkboxTokens } from './checkbox';
import { radioTokens } from './radio';
import { selectTokens } from './select';
import { tagTokens } from './tag';
import { toggleTokens } from './toggle';
import { iconTokens } from './icon';
import { spinnerTokens } from './spinner';
import { rateTokens } from './rate';
import { spaceTokens } from './space';
import { timelineTokens } from './timeline';
import { qrcodeTokens } from './qrcode';
import { listTokens } from './list';

// Combined component tokens export
export const componentTokens = {
  avatar: avatarTokens,
  badge: badgeTokens,
  button: buttonTokens,
  input: inputTokens,
  card: cardTokens,
  modal: modalTokens,
  checkbox: checkboxTokens,
  radio: radioTokens,
  select: selectTokens,
  tag: tagTokens,
  toggle: toggleTokens,
  icon: iconTokens,
  spinner: spinnerTokens,
  rate: rateTokens,
  space: spaceTokens,
  timeline: timelineTokens,
  qrcode: qrcodeTokens,
  list: listTokens,
} as const;

export default componentTokens;
