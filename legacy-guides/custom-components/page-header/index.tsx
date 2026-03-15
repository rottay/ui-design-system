/**
 * PageHeader - Main Export
 */

import type { PageHeaderProps } from './core';
import { PAGE_HEADER_DEFAULTS } from './core';
import { PAGE_HEADER_PRESETS } from './presets';

export { type PageHeaderProps, type PageHeaderPreset, type BreadcrumbItem, type PageHeaderAction, PAGE_HEADER_DEFAULTS } from './core';
export * from './presets';

export function PageHeader(props: PageHeaderProps): React.ReactElement {
  const preset = props.preset ?? PAGE_HEADER_DEFAULTS.preset ?? 'standard';
  const PresetComponent = PAGE_HEADER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PageHeader.displayName = 'PageHeader';
