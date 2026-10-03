import { createElement } from 'react';
import { PatternGridView, type GridViewProps } from '@rottay/design-system';

declare function measure(): number;

const preset: GridViewProps = { columns: 3 };

export function Views(props: GridViewProps) {
  return (
    <>
      <PatternGridView {...props} />
      <PatternGridView columns={measure()} />
      {createElement(PatternGridView, { columns: 2 })}
      <PatternGridView {...preset} />
    </>
  );
}
