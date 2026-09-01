'use client';
import React from 'react';
import type { WidgetBoardProps } from '../../contracts';
import { WidgetBoardEngine } from '../foundation';

/**
 * Modern engine for the WidgetBoard pattern.
 *
 * The anatomy is the shared foundation engine (the adaptive solver, drag /
 * resize gestures and catalog composition live there); the `ds-engine-modern`
 * scope class mirrors the family idiom so modern-only remediation can layer
 * over the shared presentation skin without touching classic/rustic paint.
 */
export default function ModernWidgetBoard(props: WidgetBoardProps): React.ReactElement {
  const { className, ...rest } = props;
  return (
    <WidgetBoardEngine
      {...rest}
      className={['ds-engine-modern', className].filter(Boolean).join(' ')}
    />
  );
}
