import { PatternGridView as Cards } from '@rottay/design-system';
import * as DS from '@rottay/design-system';

const Gallery = DS.PatternGalleryView;

export function Views() {
  return (
    <>
      <Cards />
      <DS.PatternGridView items={[]} />
      <Gallery />
    </>
  );
}
