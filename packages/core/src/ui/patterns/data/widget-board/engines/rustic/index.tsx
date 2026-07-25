'use client';
import React from 'react';
import type { WidgetBoardProps } from '../../contracts';
import { WidgetBoardEngine } from '../shared';
export default function RusticWidgetBoard(props: WidgetBoardProps): React.ReactElement {
  return <WidgetBoardEngine {...props} />;
}
