'use client';

/**
 * @fileoverview Content icons - files, folders, bookmarks
 */

import {
  FileText,
  FileDown,
  Folder,
  Braces,
  BookmarkPlus,
  Bookmark,
  Image,
} from 'lucide-react';
import { createIcon } from '../factory';

export const FileTextIcon = createIcon(FileText, 'FileTextIcon');
export const FileDownIcon = createIcon(FileDown, 'FileDownIcon');
export const FolderIcon = createIcon(Folder, 'FolderIcon');
export const BracesIcon = createIcon(Braces, 'BracesIcon');
export const BookmarkPlusIcon = createIcon(BookmarkPlus, 'BookmarkPlusIcon');
export const BookmarkIcon = createIcon(Bookmark, 'BookmarkIcon');
export const ImageIcon = createIcon(Image, 'ImageIcon');
