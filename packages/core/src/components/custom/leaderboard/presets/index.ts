import type { LeaderboardPreset } from '../core';
import { Numbered } from './numbered';
import { Avatar } from './avatar';
import { Bar } from './bar';

export const PRESETS: Record<LeaderboardPreset, React.ComponentType<any>> = {
  'numbered': Numbered,
  'avatar': Avatar,
  'bar': Bar,
};
