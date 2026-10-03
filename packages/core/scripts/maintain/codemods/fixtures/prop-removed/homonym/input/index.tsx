import { Grid } from '@rottay/design-system';
import { PatternGridView } from './local';
import { PatternGalleryView } from 'other-kit';

export function Views() {
  return (
    <>
      <PatternGridView columns={3} minColumnWidth={240} />
      <PatternGalleryView columns={2} />
      <Grid columns={3} minColumnWidth={200} />
    </>
  );
}
