import { PatternGalleryView, PatternGridView } from '@rottay/design-system';

export function Views({ items }: { items: unknown[] }) {
  return (
    <>
      <PatternGridView items={items} />
      <PatternGridView
        items={items}
        renderCard={() => null}
      />
      <PatternGalleryView items={items}></PatternGalleryView>
    </>
  );
}
