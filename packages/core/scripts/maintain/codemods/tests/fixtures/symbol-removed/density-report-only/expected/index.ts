import type { DensityProfile, MarkdownDensity, VerticalManifest } from '@rottay/design-system';
import type { Density } from '@rottay/design-system';

export const manifestDensity: DensityProfile = 'compact';
export const markdownDensity: MarkdownDensity = 'comfortable';
export const legacy: Density = 'normal';

export function densityOf(manifest: VerticalManifest) {
  return manifest.density;
}
