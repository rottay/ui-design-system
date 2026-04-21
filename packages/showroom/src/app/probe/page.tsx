export default function ProbePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: '#0b1020',
        color: '#f8fafc',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ display: 'grid', gap: 12, textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>
          showroom probe
        </h1>
        <p style={{ margin: 0, maxWidth: 560, lineHeight: 1.6, color: '#cbd5e1' }}>
          If you can read this, Next is serving a minimal route correctly and the
          failure lives inside the showroom runtime tree, not the base app server.
        </p>
      </div>
    </main>
  );
}
