import { resolveDocumentRootAttributes, type DocumentDensityPosture } from '@rottay/design-system/server';

export function rootFor(density: DocumentDensityPosture) {
  return resolveDocumentRootAttributes({ themeMode: 'light', engine: 'modern', locale: 'en', density });
}
