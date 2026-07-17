'use client';

import { MotionProvider, ParticleField } from '@rottay/design-system';
import type { CSSProperties } from 'react';

const PRIMARY_SCOPE = {
  '--particle-probe-color': '#13706c',
} as CSSProperties;

const SECONDARY_SCOPE = {
  '--particle-probe-color': '#d97864',
} as CSSProperties;

const STYLES = `
  * { box-sizing: border-box; }

  body {
    margin: 0;
    background: #0f1418;
    color: #f6f2e9;
  }

  .particle-probe {
    min-height: 100vh;
    padding: 24px;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }

  .particle-probe__intro {
    width: min(100%, 720px);
    margin: 0 auto 24px;
  }

  .particle-probe__intro h1 {
    margin: 0 0 8px;
    font-size: clamp(1.75rem, 6vw, 3rem);
  }

  .particle-probe__intro p,
  .particle-probe__content p {
    margin: 0;
    color: #c8ced3;
    line-height: 1.6;
  }

  .particle-probe__field {
    width: min(100%, 920px);
    min-height: 420px;
    margin: 0 auto;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--particle-probe-color) 64%, white);
    border-radius: 28px;
    background:
      radial-gradient(circle at 12% 16%, color-mix(in srgb, var(--particle-probe-color) 22%, transparent), transparent 42%),
      #151b20;
  }

  .particle-probe__content {
    display: grid;
    min-height: 420px;
    place-content: end start;
    gap: 8px;
    padding: clamp(24px, 7vw, 56px);
  }

  .particle-probe__content strong {
    font-size: clamp(1.35rem, 4vw, 2.2rem);
  }

  .particle-probe__spacer {
    display: grid;
    min-height: 130vh;
    place-items: center;
    color: #89939b;
    text-align: center;
  }

  @media (max-width: 480px) {
    .particle-probe { padding: 16px; }
    .particle-probe__field,
    .particle-probe__content { min-height: 320px; }
    .particle-probe__field { border-radius: 18px; }
  }
`;

export default function ParticleRuntimeProbePage() {
  return (
    <MotionProvider
      profile="expressive"
      tenantDial={{ ambient: 'subtle', durationScale: 1, intensity: 1 }}
    >
      <main className="particle-probe">
        <style>{STYLES}</style>
        <header className="particle-probe__intro">
          <h1>Particle runtime certification</h1>
          <p>
            Two independent paint scopes exercise allocation, viewport suspension,
            lease handoff and meaningful static content.
          </p>
        </header>

        <section data-particle-probe="primary" style={PRIMARY_SCOPE}>
          <ParticleField
            className="particle-probe__field"
            color="var(--particle-probe-color)"
            count={1200}
            density="high"
            intensity="high"
          >
            <div className="particle-probe__content">
              <strong>Operational signal map</strong>
              <p>The canvas is decorative; this explanation remains available in every policy.</p>
            </div>
          </ParticleField>
        </section>

        <div className="particle-probe__spacer" aria-hidden="true">
          Scroll boundary for deterministic IntersectionObserver handoff
        </div>

        <section data-particle-probe="secondary" style={SECONDARY_SCOPE}>
          <ParticleField
            className="particle-probe__field"
            color="var(--particle-probe-color)"
            count={1200}
            density="high"
            intensity="high"
          >
            <div className="particle-probe__content">
              <strong>Candidate relationship field</strong>
              <p>The second root owns a distinct provider-scoped color and the same fallback meaning.</p>
            </div>
          </ParticleField>
        </section>
      </main>
    </MotionProvider>
  );
}
