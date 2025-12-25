'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { ImageProps } from '../../../types/components/image';
import TitanImage from './engines/titan';

export const Image = createEngineComponent<ImageProps>({
  titan: TitanImage,
  hermes: lazyEngine(() => import('./engines/hermes')),
  apollo: lazyEngine(() => import('./engines/apollo')),
  athena: lazyEngine(() => import('./engines/athena')),
}, { displayName: 'Image' });

export default Image;
