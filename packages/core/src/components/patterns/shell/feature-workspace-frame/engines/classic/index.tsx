'use client';

import React from 'react';
import type { FeatureWorkspaceFrameProps } from '../../contracts';
import { FeatureWorkspaceFrameEngine } from '../foundation';

export default function ClassicFeatureWorkspaceFrame(
  props: FeatureWorkspaceFrameProps,
): React.ReactElement {
  return <FeatureWorkspaceFrameEngine {...props} />;
}
