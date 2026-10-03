import { PatternGridView, type GridViewProps } from '@rottay/design-system';
import { Deck } from './deck';

function Cards(props: GridViewProps) {
  return <PatternGridView {...props} />;
}

export function Views() {
  return (
    <>
      <Cards columns={3} />
      <Deck columns={2} />
    </>
  );
}
