'use client';
import React from 'react';
import type { WidgetBoardProps } from '../../contracts';
import { WidgetBoardEngine } from '../shared';
export default function ClassicWidgetBoard(props: WidgetBoardProps): React.ReactElement {
  return <WidgetBoardEngine {...props} />;
}
