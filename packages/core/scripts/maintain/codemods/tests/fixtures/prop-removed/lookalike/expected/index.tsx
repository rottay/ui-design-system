import { PatternGridView } from '@rottay/design-system';

// <PatternGridView columns={3} /> used to take a column count.
/* minColumnWidth={240} was ignored too. */
export const snippet = `<PatternGridView columns={3} minColumnWidth={240} />`;
export const sentence = 'PatternGridView columns={3}';

export function Views(PatternGridView: (props: { columns: number }) => null) {
  return <PatternGridView columns={3} />;
}

export const Component = PatternGridView;
