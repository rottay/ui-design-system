'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { UploadProps } from './types';
import TitanUpload from './engines/titan';

/**
 * Upload Component
 *
 * Multi-engine file upload that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Engines:
 * - titan: Ant Design Upload (default, full featured)
 * - hermes: DaisyUI-based upload (lazy loaded)
 * - apollo: Native HTML + Tailwind upload (lazy loaded)
 * - athena: Re-exports apollo implementation
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Upload
 *   action="/api/upload"
 *   onChange={(info) => console.log(info)}
 * />
 *
 * // Drag and drop
 * <Upload
 *   type="drag"
 *   multiple
 *   accept="image/*"
 * >
 *   <p>Drop files here</p>
 * </Upload>
 *
 * // Picture card mode
 * <Upload
 *   listType="picture-card"
 *   fileList={fileList}
 *   onChange={({ fileList }) => setFileList(fileList)}
 * />
 *
 * // With custom request
 * <Upload
 *   customRequest={({ file, onSuccess, onError }) => {
 *     // Handle upload manually
 *   }}
 * />
 * ```
 */
export const Upload = createEngineComponent<UploadProps>(
  {
    titan: TitanUpload,
    hermes: lazyEngine(() =>
      import('./engines/hermes').then((m) => ({
        default: m.default,
      }))
    ),
    apollo: lazyEngine(() =>
      import('./engines/apollo').then((m) => ({
        default: m.default,
      }))
    ),
    athena: lazyEngine(() =>
      import('./engines/athena').then((m) => ({
        default: m.default,
      }))
    ),
  },
  { displayName: 'Upload' }
);
