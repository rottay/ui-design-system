import type { FileUploadZoneProps } from './core';
import { FILE_UPLOAD_ZONE_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { FileUploadZoneProps, FileUploadZonePreset, UploadFile, FileUploadStatus } from './core';
export { FILE_UPLOAD_ZONE_DEFAULTS } from './core';

export function FileUploadZone(props: FileUploadZoneProps): React.ReactElement {
  const preset = props.preset ?? FILE_UPLOAD_ZONE_DEFAULTS.preset ?? 'dropzone';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

FileUploadZone.displayName = 'FileUploadZone';
