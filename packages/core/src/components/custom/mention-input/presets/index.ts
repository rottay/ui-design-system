import React from 'react';
import type { MentionInputPreset } from '../core';

import Standard from './standard';
import Minimal from './minimal';

export const PRESETS: Record<MentionInputPreset, React.ComponentType<any>> = {
  standard: Standard,
  minimal: Minimal,
};
