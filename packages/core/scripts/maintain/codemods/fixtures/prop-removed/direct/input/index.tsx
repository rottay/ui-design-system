import { PatternGalleryView, PatternGridView } from '@rottay/design-system';

export function Views({ items }: { items: unknown[] }) {
  return (
    <>
      <PatternGridView columns={3} minColumnWidth={240} items={items} />
      <PatternGridView
        items={items}
        columns="auto"
        renderCard={() => null}
      />
      <PatternGalleryView items={items} columns={items.length > 3 ? 4 : 2} minColumnWidth={180}></PatternGalleryView>
    </>
  );
}
