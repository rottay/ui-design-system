import type { LogoCloudProps } from './core';
import { LOGO_CLOUD_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { LogoCloudProps, LogoCloudPreset, LogoItem } from './core';
export { LOGO_CLOUD_DEFAULTS } from './core';

export function LogoCloud(props: LogoCloudProps): React.ReactElement {
  const preset = props.preset ?? LOGO_CLOUD_DEFAULTS.preset ?? 'grid';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

LogoCloud.displayName = 'LogoCloud';
