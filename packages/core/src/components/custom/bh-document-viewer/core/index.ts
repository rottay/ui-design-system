/**
 * BhDocumentViewer - Core Interface
 * PDF/image viewer placeholder with annotation tools
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhDocumentViewerPreset = 'viewer' | 'compact';

export interface DocumentAnnotation {
  id: string;
  page: number;
  x: number;
  y: number;
  text: string;
  color?: string;
}

export interface BhDocumentViewerProps extends EngineAwareProps {
  preset?: BhDocumentViewerPreset;

  /** Document URL or name */
  documentUrl?: string;

  /** Document name for display */
  documentName?: string;

  /** Document type */
  documentType?: 'pdf' | 'image' | 'doc';

  /** Total pages */
  totalPages?: number;

  /** Current page */
  currentPage?: number;

  /** Annotations on the document */
  annotations?: DocumentAnnotation[];

  /** Callback when page changes */
  onPageChange?: (page: number) => void;

  /** Callback when an annotation is added */
  onAnnotationAdd?: (annotation: Omit<DocumentAnnotation, 'id'>) => void;

  /** Callback when an annotation is clicked */
  onAnnotationClick?: (annotationId: string) => void;

  /** Callback when download is clicked */
  onDownload?: () => void;

  /** Zoom level (1 = 100%) */
  zoom?: number;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_DOCUMENT_VIEWER_DEFAULTS: Partial<BhDocumentViewerProps> = {
  preset: 'viewer',
  totalPages: 3,
  currentPage: 1,
  zoom: 1,
};
