import { resolveDocumentRootAttributes, type DensityPosture } from '@rottay/design-system/server';

export function rootFor(density: DensityPosture) {
  return resolveDocumentRootAttributes({ themeMode: 'light', engine: 'modern', locale: 'en', density });
}
