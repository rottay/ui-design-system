/**
 * @fileoverview Upload Component - Rottay Design System
 * @description A file upload component with drag-and-drop support, progress tracking,
 * file list management, and customizable display modes for handling file submissions.
 *
 * @remarks
 * The Upload component provides comprehensive file upload functionality for:
 * - **Document uploads**: PDFs, Word documents, spreadsheets
 * - **Image uploads**: Photos, avatars, galleries
 * - **Bulk uploads**: Multiple files with progress tracking
 * - **Form submissions**: File attachments in forms
 *
 * Key features:
 * - **Multi-engine support**: Titan (Ant Design), Hermes (DaisyUI), Apollo (Vanilla)
 * - **Drag and drop**: Upload.Dragger for drag-drop interface
 * - **Multiple files**: Upload multiple files at once
 * - **Progress tracking**: Real-time upload progress display
 * - **File list display**: Text, picture, picture-card, picture-circle
 * - **Custom request**: Override default upload behavior
 * - **Validation hooks**: beforeUpload for file validation
 * - **Preview/Download**: File preview and download actions
 *
 * @example Basic upload
 * ```tsx
 * import { Upload } from '@rottay/design-system';
 *
 * <Upload action="/api/upload">
 *   <Button>Click to Upload</Button>
 * </Upload>
 * ```
 *
 * @example Image upload with preview
 * ```tsx
 * <Upload
 *   action="/api/upload"
 *   listType="picture-card"
 *   accept="image/*"
 *   onPreview={(file) => window.open(file.url)}
 * >
 *   <span>+ Upload</span>
 * </Upload>
 * ```
 *
 * @example Drag and drop upload
 * ```tsx
 * <Upload.Dragger action="/api/upload" multiple>
 *   <p>Drag files here or click to select</p>
 * </Upload.Dragger>
 * ```
 *
 * @example With file validation
 * ```tsx
 * <Upload
 *   action="/api/upload"
 *   beforeUpload={(file) => {
 *     const isImage = file.type.startsWith('image/');
 *     const isSmall = file.size < 2 * 1024 * 1024; // 2MB
 *     return isImage && isSmall;
 *   }}
 * >
 *   <Button>Upload Image (max 2MB)</Button>
 * </Upload>
 * ```
 *
 * @example Controlled file list
 * ```tsx
 * const [fileList, setFileList] = useState<UploadFile[]>([]);
 *
 * <Upload
 *   fileList={fileList}
 *   onChange={({ fileList }) => setFileList(fileList)}
 *   action="/api/upload"
 * >
 *   <Button>Upload</Button>
 * </Upload>
 * ```
 *
 * @example Custom upload request
 * ```tsx
 * <Upload
 *   customRequest={async ({ file, onProgress, onSuccess }) => {
 *     const formData = new FormData();
 *     formData.append('file', file);
 *     // Custom upload logic
 *     onSuccess?.(response, file);
 *   }}
 * >
 *   <Button>Custom Upload</Button>
 * </Upload>
 * ```
 *
 * @example Multi-engine usage
 * ```tsx
 * // Titan engine (Ant Design - default)
 * <Upload engine="titan" action="/api/upload" listType="picture" />
 *
 * // Hermes engine (DaisyUI/Tailwind)
 * <Upload engine="hermes" action="/api/upload" />
 *
 * // Apollo engine (Pure HTML/CSS)
 * <Upload engine="apollo" action="/api/upload" />
 * ```
 *
 * @see {@link UploadProps} for component props
 * @see {@link UploadFile} for file structure
 * @see {@link DraggerProps} for drag-drop props
 * @module Upload
 * @category Inputs
 * @package @rottay/design-system
 */
import { createEngineComponent } from '../../../../core/engines/factory';
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
