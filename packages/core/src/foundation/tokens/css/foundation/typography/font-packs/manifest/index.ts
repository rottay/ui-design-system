/**
 * @fileoverview Font-pack registry manifest (W4-B1).
 *
 * The single source of truth mapping each self-hosted, latin-subset, OFL font
 * pack to the physical woff2 face files it ships, the custom property its css
 * defines, and the fallback stack that property carries. Re-exported from the
 * `@rottay/design-system/server` entrypoint so an SSR shell can emit
 * `<link rel="preload" as="font" type="font/woff2" crossorigin>` tags for the
 * packs a tenant's envelope enables, without importing the css.
 *
 * The pack css itself lives at ../<id>/index.css and is published as the opt-in
 * subpath @rottay/design-system/fonts/<id>.css. The css is never imported by
 * styles.css or any default bundle; consumers pay only for the packs they load.
 *
 * `variable` faces carry a weight RANGE (a single variable woff2 covers it);
 * `static` faces carry a single instance weight. `path` is relative to the pack
 * css so the app bundler fingerprints the same url() the css references.
 */

export type FontPackRole = 'display' | 'text' | 'mono';

export interface FontPackFace {
  /** Relative to the pack css (../<id>/index.css), matching its url(). */
  readonly path: string;
  readonly family: string;
  /** '400 700' for a variable-range face, '400' for a static instance. */
  readonly weight: string;
  readonly style: 'normal';
  readonly variable: boolean;
}

export interface FontPackEntry {
  readonly id: string;
  readonly role: FontPackRole;
  /** Public opt-in subpath an app imports to load this pack. */
  readonly cssSubpath: string;
  /** The custom property the pack css defines in :root. */
  readonly variable: string;
  /** The family list that custom property carries (matches the css :root). */
  readonly fallbackStack: string;
  readonly files: readonly FontPackFace[];
}

export const FONT_PACK_MANIFEST = {
  'editorial-display': {
    id: 'editorial-display',
    role: 'display',
    cssSubpath: '@rottay/design-system/fonts/editorial-display.css',
    variable: '--ds-font-pack-editorial-display',
    fallbackStack: "'Fraunces', Georgia, 'Times New Roman', serif",
    files: [
      {
        path: './fraunces-latin-variable.woff2',
        family: 'Fraunces',
        weight: '400 700',
        style: 'normal',
        variable: true,
      },
    ],
  },
  'editorial-text': {
    id: 'editorial-text',
    role: 'text',
    cssSubpath: '@rottay/design-system/fonts/editorial-text.css',
    variable: '--ds-font-pack-editorial-text',
    fallbackStack: "'Newsreader', Georgia, 'Times New Roman', serif",
    files: [
      {
        path: './newsreader-latin-variable.woff2',
        family: 'Newsreader',
        weight: '400 600',
        style: 'normal',
        variable: true,
      },
    ],
  },
  'grotesk-display': {
    id: 'grotesk-display',
    role: 'display',
    cssSubpath: '@rottay/design-system/fonts/grotesk-display.css',
    variable: '--ds-font-pack-grotesk-display',
    fallbackStack: "'Space Grotesk', ui-sans-serif, system-ui, -apple-system, sans-serif",
    files: [
      {
        path: './space-grotesk-latin-variable.woff2',
        family: 'Space Grotesk',
        weight: '400 700',
        style: 'normal',
        variable: true,
      },
    ],
  },
  'humanist-text': {
    id: 'humanist-text',
    role: 'text',
    cssSubpath: '@rottay/design-system/fonts/humanist-text.css',
    variable: '--ds-font-pack-humanist-text',
    fallbackStack: "'Public Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
    files: [
      {
        path: './public-sans-latin-variable.woff2',
        family: 'Public Sans',
        weight: '400 600',
        style: 'normal',
        variable: true,
      },
    ],
  },
  'geometric-display': {
    id: 'geometric-display',
    role: 'display',
    cssSubpath: '@rottay/design-system/fonts/geometric-display.css',
    variable: '--ds-font-pack-geometric-display',
    fallbackStack: "'Outfit', ui-sans-serif, system-ui, -apple-system, sans-serif",
    files: [
      {
        path: './outfit-latin-variable.woff2',
        family: 'Outfit',
        weight: '400 700',
        style: 'normal',
        variable: true,
      },
    ],
  },
  'plex-mono': {
    id: 'plex-mono',
    role: 'mono',
    cssSubpath: '@rottay/design-system/fonts/plex-mono.css',
    variable: '--ds-font-pack-plex-mono',
    fallbackStack: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, monospace",
    files: [
      {
        path: './ibm-plex-mono-latin-400.woff2',
        family: 'IBM Plex Mono',
        weight: '400',
        style: 'normal',
        variable: false,
      },
      {
        path: './ibm-plex-mono-latin-600.woff2',
        family: 'IBM Plex Mono',
        weight: '600',
        style: 'normal',
        variable: false,
      },
    ],
  },
} as const satisfies Record<string, FontPackEntry>;

export type FontPackId = keyof typeof FONT_PACK_MANIFEST;

export const FONT_PACK_IDS = Object.keys(FONT_PACK_MANIFEST) as FontPackId[];
