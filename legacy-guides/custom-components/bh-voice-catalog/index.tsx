/**
 * BhVoiceCatalog - Main Export
 * Voice grid with preview, filters, language tags
 */

import type { BhVoiceCatalogProps } from './core';
import { BH_VOICE_CATALOG_DEFAULTS } from './core';
import { BH_VOICE_CATALOG_PRESETS } from './presets';

export {
  type BhVoiceCatalogProps,
  type BhVoiceCatalogPreset,
  type VoiceProfile,
  BH_VOICE_CATALOG_DEFAULTS,
} from './core';
export * from './presets';

export function BhVoiceCatalog(props: BhVoiceCatalogProps): React.ReactElement {
  const preset = props.preset ?? BH_VOICE_CATALOG_DEFAULTS.preset ?? 'grid';
  const PresetComponent = BH_VOICE_CATALOG_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhVoiceCatalog.displayName = 'BhVoiceCatalog';
