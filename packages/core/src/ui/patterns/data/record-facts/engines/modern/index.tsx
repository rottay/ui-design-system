'use client';
import React from 'react';
import type { RecordFactsProps } from '../../contracts';
import { RecordFactsEngine } from '../foundation';

/**
 * Modern engine for the RecordFacts pattern.
 *
 * The anatomy is the shared foundation engine (all three engines render the
 * same component today); the modern differentiation is the `ds-engine-modern`
 * scope class that lets the modern runtime skin
 * (`foundation/tokens/css/runtime/engines/modern/skin/record-facts.css`)
 * layer its remediation over the shared presentation skin without touching
 * classic/rustic paint.
 */
export default function ModernRecordFacts(props: RecordFactsProps): React.ReactElement {
  const { className, ...rest } = props;
  return (
    <RecordFactsEngine
      {...rest}
      className={['ds-engine-modern', className].filter(Boolean).join(' ')}
    />
  );
}
