'use client';

/**
 * @fileoverview Media icons - visibility, ratings, audio, visual
 */

import {
  Eye,
  EyeOff,
  Star,
  Zap,
  Sparkles,
  Mic,
  MicOff,
  AudioLines,
  Camera,
} from 'lucide-react';
import { createIcon } from '../factory';

export const EyeIcon = createIcon(Eye, 'EyeIcon');
export const EyeOffIcon = createIcon(EyeOff, 'EyeOffIcon');
export const StarIcon = createIcon(Star, 'StarIcon');
export const ZapIcon = createIcon(Zap, 'ZapIcon');
export const SparklesIcon = createIcon(Sparkles, 'SparklesIcon');
export const MicIcon = createIcon(Mic, 'MicIcon');
export const MicOffIcon = createIcon(MicOff, 'MicOffIcon');
export const AudioLinesIcon = createIcon(AudioLines, 'AudioLinesIcon');
export const CameraIcon = createIcon(Camera, 'CameraIcon');
