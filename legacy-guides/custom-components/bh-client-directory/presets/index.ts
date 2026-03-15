/**
 * BhClientDirectory - All Presets
 */

export { DirectoryBhClientDirectory } from './directory';
export { CardsBhClientDirectory } from './cards';

import type { BhClientDirectoryPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhClientDirectoryProps } from '../core';
import { DirectoryBhClientDirectory } from './directory';
import { CardsBhClientDirectory } from './cards';

export const BH_CLIENT_DIRECTORY_PRESETS: Record<BhClientDirectoryPreset, ComponentType<BhClientDirectoryProps>> = {
  directory: DirectoryBhClientDirectory,
  cards: CardsBhClientDirectory,
};
