/**
 * EvMediaGallery - Core Interface
 * Event media gallery
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvMediaGalleryPreset = 'grid' | 'moderation';

export interface MediaFile {
  id: string;
  type: "photo" | "video";
  url: string;
  thumbnail?: string;
  uploadedBy: string;
  uploadedAt: Date;
  reactions: number;
  status: "approved" | "pending" | "rejected";
  caption?: string;
}

export interface EvMediaGalleryProps extends EngineAwareProps {
  preset?: EvMediaGalleryPreset;
  media?: MediaFile[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onUpload?: () => void;
  onMediaClick?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_MEDIA_GALLERY_DEFAULTS: Partial<EvMediaGalleryProps> = {
  preset: 'grid',

};
