'use client';
import React from 'react';
import type { WidgetBoardProps } from '../../contracts';
import { WidgetBoardEngine } from '../foundation';
export default function ModernWidgetBoard(props: WidgetBoardProps): React.ReactElement {
  return <WidgetBoardEngine {...props} />;
}
