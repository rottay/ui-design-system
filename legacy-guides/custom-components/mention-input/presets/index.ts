import type { ComponentType } from 'react';
import type { MentionInputPreset, MentionInputProps } from '../core';

import Standard from './standard';
import Minimal from './minimal';

export const PRESETS: Record<MentionInputPreset, ComponentType<MentionInputProps>> = {
  standard: Standard,
  minimal: Minimal,
};
