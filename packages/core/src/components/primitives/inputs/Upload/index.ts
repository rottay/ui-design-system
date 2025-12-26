/**
 * Upload - Engine Router (Compound Component)
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { UploadProps, DraggerProps } from './types';

export {
  type UploadProps,
  type DraggerProps,
  type UploadFile,
  type UploadChangeInfo,
  type UploadListType,
  type UploadRequestOption,
  UPLOAD_DEFAULTS,
} from './types';

const UploadBase = createEngineComponent<UploadProps>('Upload', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Upload })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Upload })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Upload })),
});

const Dragger = createEngineComponent<DraggerProps>('Upload.Dragger', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Dragger })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Dragger })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Dragger })),
});

export const Upload = Object.assign(UploadBase, {
  Dragger,
});

export default Upload;
