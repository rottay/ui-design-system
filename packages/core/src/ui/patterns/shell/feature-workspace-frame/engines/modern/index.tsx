'use client';

import React from 'react';
import type { FeatureWorkspaceFrameProps } from '../../contracts';
import { FeatureWorkspaceFrameEngine } from '../shared';

export default function ModernFeatureWorkspaceFrame(
  props: FeatureWorkspaceFrameProps,
): React.ReactElement {
  return <FeatureWorkspaceFrameEngine {...props} />;
}
