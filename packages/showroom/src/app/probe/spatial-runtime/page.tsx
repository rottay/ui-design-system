'use client';

import { SpatialExperience, type SpatialSceneLoader } from '@rottay/design-system/spatial';

const loadSpatialProbeScene: SpatialSceneLoader = async () => {
  const sceneModule = await import('./runtime/scene');
  return sceneModule.SPATIAL_PROBE_SCENE_MODULE;
};

const STYLES = `
  * { box-sizing: border-box; }

  body {
    margin: 0;
    background: #0f1418;
    color: #f6f2e9;
  }

  .spatial-probe {
    min-height: 100vh;
    padding: 24px;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }

  .spatial-probe__intro,
  .spatial-probe__experience {
    width: min(100%, 920px);
    margin-inline: auto;
  }

  .spatial-probe__intro { margin-bottom: 24px; }
  .spatial-probe__intro h1 { margin: 0 0 8px; font-size: clamp(1.75rem, 6vw, 3rem); }
  .spatial-probe__intro p,
  .spatial-probe__fallback p { color: #c8ced3; line-height: 1.6; }

  .spatial-probe__experience {
    min-height: 420px;
    overflow: hidden;
    border: 1px solid #41505a;
    border-radius: 28px;
    background: #151b20;
  }

  .spatial-probe__experience [data-spatial-visual="true"],
  .spatial-probe__experience [data-spatial-fallback],
  .spatial-probe__experience [data-spatial-scene="true"] { min-height: 420px; }

  .spatial-probe__fallback {
    display: grid;
    min-height: 420px;
    place-content: end start;
    gap: 8px;
    padding: clamp(24px, 7vw, 56px);
    background:
      radial-gradient(circle at 18% 20%, color-mix(in srgb, var(--probe-color) 24%, transparent), transparent 42%),
      #151b20;
  }

  .spatial-probe__fallback strong { font-size: clamp(1.35rem, 4vw, 2.2rem); }
  .spatial-probe__fallback p { margin: 0; }
  .spatial-probe__alternative { padding: 16px 24px; }
  .spatial-probe__spacer {
    display: grid;
    min-height: 130vh;
    place-items: center;
    color: #89939b;
    text-align: center;
  }

  .spatial-probe__experience button,
  .spatial-probe__experience summary {
    margin: 12px;
    color: inherit;
  }

  @media (max-width: 480px) {
    .spatial-probe { padding: 16px; }
    .spatial-probe__experience,
    .spatial-probe__experience [data-spatial-visual="true"],
    .spatial-probe__experience [data-spatial-fallback],
    .spatial-probe__experience [data-spatial-scene="true"],
    .spatial-probe__fallback { min-height: 320px; }
    .spatial-probe__experience { border-radius: 18px; }
  }
`;

function fallback(title: string, copy: string, color: string) {
  return (
    <div className="spatial-probe__fallback" style={{ '--probe-color': color } as React.CSSProperties}>
      <strong>{title}</strong>
      <p>{copy}</p>
    </div>
  );
}

function alternative(label: string) {
  return (
    <ul className="spatial-probe__alternative">
      <li>{label}: identity</li>
      <li>{label}: workflow</li>
      <li>{label}: evidence</li>
    </ul>
  );
}

export default function SpatialRuntimeProbePage() {
  return (
    <main className="spatial-probe">
      <style>{STYLES}</style>
      <header className="spatial-probe__intro">
        <h1>Spatial runtime certification</h1>
        <p>
          Two independent scenes exercise capability admission, one-context leasing,
          viewport handoff, bounded backing stores and meaningful static alternatives.
        </p>
      </header>

      <div data-spatial-probe="primary">
        <SpatialExperience
          className="spatial-probe__experience"
          description="A live relationship map with an equivalent text inventory."
          id="spatial-primary"
          label="Primary relationship map"
          labels={{
            alternative: 'Open primary text alternative',
            pause: 'Pause primary scene',
            resume: 'Resume primary scene',
            retry: 'Retry primary scene',
          }}
          loadScene={loadSpatialProbeScene}
          poster={fallback('Operational relationship map', 'Static meaning survives before and without WebGL.', '#13706c')}
          purpose="explanation"
          reduced={fallback('Reduced operational map', 'Motion policy selected the final reduced representation.', '#13706c')}
          alternative={alternative('Primary')}
        />
      </div>

      <div className="spatial-probe__spacer" aria-hidden="true">
        Scroll boundary for deterministic context handoff
      </div>

      <div data-spatial-probe="secondary">
        <SpatialExperience
          className="spatial-probe__experience"
          description="A second live map that cannot compete with the first scene."
          id="spatial-secondary"
          label="Secondary relationship map"
          labels={{
            alternative: 'Open secondary text alternative',
            pause: 'Pause secondary scene',
            resume: 'Resume secondary scene',
            retry: 'Retry secondary scene',
          }}
          loadScene={loadSpatialProbeScene}
          poster={fallback('Candidate relationship map', 'The second scene waits without stealing the active context.', '#d97864')}
          purpose="explanation"
          reduced={fallback('Reduced candidate map', 'The same relationships remain readable without motion.', '#d97864')}
          alternative={alternative('Secondary')}
        />
      </div>
    </main>
  );
}
