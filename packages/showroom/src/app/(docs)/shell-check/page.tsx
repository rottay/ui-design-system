export default function ShellCheckPage() {
  return (
    <section style={{ display: 'grid', gap: 16 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Shell Check</h1>
      <p style={{ maxWidth: 720, color: 'var(--ds-color-text-secondary, #475569)' }}>
        Minimal route mounted inside the docs layout to verify whether the shared shell is
        responsive independently from the heavier content pages.
      </p>
    </section>
  );
}
