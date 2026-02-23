import type { ComponentType } from 'react';
import type { ContentCardPreset, ContentCardProps } from '../core';

import Document from './document';
import LinkPreview from './link-preview';
import File from './file';

export const PRESETS: Record<ContentCardPreset, ComponentType<ContentCardProps>> = {
  document: Document,
  'link-preview': LinkPreview,
  file: File,
};
