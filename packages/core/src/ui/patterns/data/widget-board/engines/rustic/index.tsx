'use client';
import React from 'react';
import type { WidgetBoardProps } from '../../contracts';
import { WidgetBoardEngine } from '../foundation';
export default function RusticWidgetBoard(props: WidgetBoardProps): React.ReactElement {
  return <WidgetBoardEngine {...props} />;
}
