import { PatternGridView as Cards } from '@rottay/design-system';
import * as DS from '@rottay/design-system';

const Gallery = DS.PatternGalleryView;

export function Views() {
  return (
    <>
      <Cards columns={2} />
      <DS.PatternGridView minColumnWidth={200} items={[]} />
      <Gallery columns={4} />
    </>
  );
}
