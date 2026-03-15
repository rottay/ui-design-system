import type { BlogCardProps } from './core';
import { BLOG_CARD_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { BlogCardProps, BlogCardPreset, BlogAuthor } from './core';
export { BLOG_CARD_DEFAULTS } from './core';

export function BlogCard(props: BlogCardProps): React.ReactElement {
  const preset = props.preset ?? BLOG_CARD_DEFAULTS.preset ?? 'vertical';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

BlogCard.displayName = 'BlogCard';
