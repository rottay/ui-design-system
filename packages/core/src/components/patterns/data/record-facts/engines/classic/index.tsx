'use client';
import React from 'react';
import type { RecordFactsProps } from '../../contracts';
import { RecordFactsEngine } from '../foundation';

export default function ClassicRecordFacts(props: RecordFactsProps): React.ReactElement {
  return <RecordFactsEngine {...props} />;
}
