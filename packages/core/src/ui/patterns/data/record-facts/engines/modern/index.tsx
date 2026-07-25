'use client';
import React from 'react';
import type { RecordFactsProps } from '../../contracts';
import { RecordFactsEngine } from '../shared';

export default function ModernRecordFacts(props: RecordFactsProps): React.ReactElement {
  return <RecordFactsEngine {...props} />;
}
