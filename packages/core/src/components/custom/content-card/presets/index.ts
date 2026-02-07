import React from 'react';
import type { ContentCardPreset } from '../core';

import Document from './document';
import LinkPreview from './link-preview';
import File from './file';

export const PRESETS: Record<ContentCardPreset, React.ComponentType<any>> = {
  document: Document,
  'link-preview': LinkPreview,
  file: File,
};
