import { preload } from 'react-dom';
import { FONT_PACK_MANIFEST, type TenantThemeArtifact } from '@rottay/design-system/server';

// The faces of the packs this app ships (styles.css plus the layout's editorial-display import). The bundler
// gives each the same fingerprinted URL its @font-face url() gets, so the preload is the request the face reuses.
const SHIPPED_FACE_URLS: Readonly<Record<string, URL>> = {
  './space-grotesk-latin-variable.woff2': new URL('../../../../node_modules/@rottay/design-system/dist/fonts/space-grotesk-latin-variable.woff2', import.meta.url),
  './public-sans-latin-variable.woff2': new URL('../../../../node_modules/@rottay/design-system/dist/fonts/public-sans-latin-variable.woff2', import.meta.url),
  './outfit-latin-variable.woff2': new URL('../../../../node_modules/@rottay/design-system/dist/fonts/outfit-latin-variable.woff2', import.meta.url),
  './fraunces-latin-variable.woff2': new URL('../../../../node_modules/@rottay/design-system/dist/fonts/fraunces-latin-variable.woff2', import.meta.url),
  './ibm-plex-mono-latin-400.woff2': new URL('../../../../node_modules/@rottay/design-system/dist/fonts/ibm-plex-mono-latin-400.woff2', import.meta.url),
  './ibm-plex-mono-latin-600.woff2': new URL('../../../../node_modules/@rottay/design-system/dist/fonts/ibm-plex-mono-latin-600.woff2', import.meta.url),
};

/** The shipped faces of every font pack the artifact's variables name. */
export function artifactFontFaceUrls(artifact: TenantThemeArtifact): string[] {
  const values = Object.values(artifact.variables);
  const urls = new Set<string>();
  for (const pack of Object.values(FONT_PACK_MANIFEST)) {
    const named = values.some((value) => value.includes(`var(${pack.variable},`) || value.includes(`var(${pack.variable})`));
    if (!named) continue;
    for (const face of pack.files) {
      const url = SHIPPED_FACE_URLS[face.path];
      if (url) urls.add(String(url));
    }
  }
  return [...urls];
}

/**
 * A tenant face discovered only when its @font-face first applies arrives after first paint and swaps the
 * fallback out, shifting layout; requested from the document head it is ready for the first styled frame.
 */
export function preloadArtifactFontPacks(artifact: TenantThemeArtifact): void {
  for (const href of artifactFontFaceUrls(artifact)) {
    preload(href, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
  }
}
