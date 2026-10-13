'use client';

import { useState, type ComponentProps } from 'react';
import {
  PatternBrandStudio,
} from '@rottay/design-system';

type BrandStudioValue = ComponentProps<typeof PatternBrandStudio>['value'];

export function BrandStudioPreview() {
  // Controlled on purpose: an uncontrolled studio would render the editor and
  // then swallow every edit, which is exactly the kind of preview that shows
  // chrome instead of behavior.
  const [theme, setTheme] = useState<BrandStudioValue>({
    palette: { primaryColor: '#2f6feb' },
  });

  return <PatternBrandStudio vertical="bithire" value={theme} onChange={(next) => setTheme(next)} />;
}
