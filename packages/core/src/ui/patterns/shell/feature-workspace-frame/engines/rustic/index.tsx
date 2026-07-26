'use client';

import React from 'react';
import type { FeatureWorkspaceFrameProps } from '../../contracts';
import { FeatureWorkspaceFrameEngine } from '../foundation';

export default function RusticFeatureWorkspaceFrame(
  props: FeatureWorkspaceFrameProps,
): React.ReactElement {
  return <FeatureWorkspaceFrameEngine {...props} />;
}
