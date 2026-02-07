import dropzone from './dropzone';
import compact from './compact';
import inline from './inline';

export { dropzone, compact, inline };

export const PRESETS = {
  dropzone,
  compact,
  inline,
} as const;
