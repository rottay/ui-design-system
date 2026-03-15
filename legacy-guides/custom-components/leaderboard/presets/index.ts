import type { LeaderboardPreset, LeaderboardProps } from '../core';
import type { ComponentType } from 'react';
import { Numbered } from './numbered';
import { Avatar } from './avatar';
import { Bar } from './bar';

export const PRESETS: Record<LeaderboardPreset, ComponentType<LeaderboardProps>> = {
  'numbered': Numbered,
  'avatar': Avatar,
  'bar': Bar,
};
