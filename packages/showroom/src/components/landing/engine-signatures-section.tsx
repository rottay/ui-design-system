export type EngineSignatureId = 'classic' | 'modern' | 'rustic';

export interface EngineSignaturesSectionProps {
  className?: string;
  description?: string;
  eyebrow?: string;
  includeStyles?: boolean;
  title?: string;
}

interface EngineSignatureDefinition {
  id: EngineSignatureId;
  index: string;
  name: string;
  posture: string;
  note: string;
  fingerprint: ReadonlyArray<{
    label: string;
    value: string;
  }>;
}

const CONTRACT_LOCKS = [
  'Same content model',
  'Identical hierarchy and labels',
  'Same action logic and intent',
] as const;

const SIGNATURE_SHIFTS = [
  'Density and rhythm',
  'Radius and silhouette',
  'Chrome weight and framing',
  'Surface quiet and finish',
] as const;

const SCENE_STATS = [
  { label: '18', detail: 'active reviews' },
  { label: '06', detail: 'due today' },
  { label: '02', detail: 'blocked' },
] as const;

const SCENE_ITEMS = [
  {
    kicker: 'Packet',
    title: 'Review candidate packet',
    detail: 'Resume, scorecard, and interviewer notes stay in the same order.',
  },
  {
    kicker: 'Alignment',
    title: 'Confirm role alignment',
    detail: 'Shared priorities and approval logic remain fixed across renderers.',
  },
  {
    kicker: 'Decision',
    title: 'Publish decision',
    detail: 'The renderer changes posture, not the workflow contract underneath it.',
  },
] as const;

const ENGINE_SIGNATURES: ReadonlyArray<EngineSignatureDefinition> = [
  {
    id: 'classic',
    index: '01',
    name: 'Classic',
    posture: 'Sharper enterprise control',
    note: 'Firmer borders, denser spacing, and a more directive command surface.',
    fingerprint: [
      { label: 'Density', value: 'Compact' },
      { label: 'Chrome', value: 'Precise' },
      { label: 'Radius', value: '14px' },
    ],
  },
  {
    id: 'modern',
    index: '02',
    name: 'Modern',
    posture: 'Friendlier product warmth',
    note: 'Rounder silhouettes, calmer pacing, and more room around the same workflow.',
    fingerprint: [
      { label: 'Density', value: 'Balanced' },
      { label: 'Chrome', value: 'Rounded' },
      { label: 'Radius', value: '24px' },
    ],
  },
  {
    id: 'rustic',
    index: '03',
    name: 'Rustic',
    posture: 'Quiet premium restraint',
    note: 'Lower-noise chrome, editorial spacing, and a quieter sense of control.',
    fingerprint: [
      { label: 'Density', value: 'Airy' },
      { label: 'Chrome', value: 'Minimal' },
      { label: 'Radius', value: '18px' },
    ],
  },
] as const;

export const engineSignaturesSectionStyles = `
  .engine-signatures-section {
    position: relative;
    color: var(--landing-ink, #131110);
  }

  .engine-signatures-section,
  .engine-signatures-section * {
    box-sizing: border-box;
  }

  .engine-signatures-section__frame {
    position: relative;
    overflow: hidden;
    padding: clamp(26px, 3.3vw, 40px);
    border: 1px solid var(--landing-line, rgba(19, 17, 16, 0.14));
    border-radius: 36px;
    background:
      radial-gradient(circle at top right, rgba(255, 255, 255, 0.92) 0%, transparent 32%),
      linear-gradient(
        180deg,
        rgba(251, 251, 249, 0.96) 0%,
        rgba(244, 244, 241, 0.94) 52%,
        rgba(239, 239, 235, 0.96) 100%
      );
    box-shadow: var(--landing-shadow, 0 22px 56px rgba(19, 17, 16, 0.08));
    isolation: isolate;
  }

  .engine-signatures-section__frame::before,
  .engine-signatures-section__frame::after {
    content: "";
    position: absolute;
    pointer-events: none;
    z-index: 0;
  }

  .engine-signatures-section__frame::before {
    inset: -18% auto auto -8%;
    width: 34rem;
    height: 34rem;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.42), transparent 68%);
    filter: blur(18px);
  }

  .engine-signatures-section__frame::after {
    inset: auto -12% -28% auto;
    width: 26rem;
    height: 26rem;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(17, 17, 17, 0.08), transparent 70%);
    filter: blur(26px);
  }

  .engine-signatures-section__header,
  .engine-signatures-section__proof-rail,
  .engine-signatures-section__body {
    position: relative;
    z-index: 1;
  }

  .engine-signatures-section__header {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.9fr);
    gap: clamp(22px, 2.8vw, 38px);
    align-items: end;
  }

  .engine-signatures-section__eyebrow,
  .engine-signatures-section__card-label,
  .engine-signatures-section__panel-kicker,
  .engine-signatures-section__scene-subtitle,
  .engine-signatures-section__stat-detail,
  .engine-signatures-section__item-kicker,
  .engine-signatures-section__fingerprint-label {
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.72rem;
    font-weight: 700;
  }

  .engine-signatures-section__eyebrow,
  .engine-signatures-section__card-label,
  .engine-signatures-section__scene-subtitle,
  .engine-signatures-section__stat-detail,
  .engine-signatures-section__item-kicker,
  .engine-signatures-section__fingerprint-label {
    color: var(--landing-subtle, #8d8b86);
  }

  .engine-signatures-section__eyebrow {
    margin-bottom: 10px;
  }

  .engine-signatures-section__title,
  .engine-signatures-section__description,
  .engine-signatures-section__lead,
  .engine-signatures-section__panel-name,
  .engine-signatures-section__panel-posture,
  .engine-signatures-section__panel-note,
  .engine-signatures-section__scene-title,
  .engine-signatures-section__item-title,
  .engine-signatures-section__item-detail,
  .engine-signatures-section__fingerprint-value,
  .engine-signatures-section__contract-item,
  .engine-signatures-section__proof-chip,
  .engine-signatures-section__panel-tag {
    margin: 0;
  }

  .engine-signatures-section__title {
    font-family:
      var(--showroom-font-display),
      "Iowan Old Style",
      "Palatino Linotype",
      "URW Palladio L",
      "Book Antiqua",
      Georgia,
      serif;
    font-size: clamp(2rem, 3.8vw, 3.4rem);
    line-height: 0.96;
    letter-spacing: -0.05em;
    max-width: 12ch;
    text-wrap: balance;
  }

  .engine-signatures-section__description {
    margin: 14px 0 0;
    max-width: 54ch;
    color: var(--landing-muted, #666561);
    font-size: 1rem;
    line-height: 1.74;
  }

  .engine-signatures-section__summary {
    display: grid;
    gap: 16px;
    padding: clamp(18px, 2.2vw, 22px);
    border: 1px solid var(--landing-line, rgba(19, 17, 16, 0.14));
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.78);
    backdrop-filter: blur(10px);
  }

  .engine-signatures-section__lead {
    color: var(--landing-ink, #131110);
    font-size: 1rem;
    line-height: 1.65;
  }

  .engine-signatures-section__summary-rule {
    width: 100%;
    height: 1px;
    background: linear-gradient(
      90deg,
      rgba(19, 17, 16, 0.14) 0%,
      rgba(19, 17, 16, 0.02) 100%
    );
  }

  .engine-signatures-section__summary-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .engine-signatures-section__summary-metric {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  .engine-signatures-section__summary-metric strong {
    display: block;
    color: var(--landing-ink, #131110);
    font-size: 0.95rem;
    line-height: 1.25;
  }

  .engine-signatures-section__summary-metric span {
    display: block;
    color: var(--landing-muted, #666561);
    font-size: 0.82rem;
    line-height: 1.45;
  }

  .engine-signatures-section__proof-rail {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: clamp(20px, 3vw, 30px);
    padding-top: clamp(20px, 2.4vw, 26px);
    border-top: 1px solid var(--landing-line, rgba(19, 17, 16, 0.14));
  }

  .engine-signatures-section__proof-chip {
    display: inline-flex;
    align-items: center;
    min-height: 2.4rem;
    padding: 0.62rem 0.92rem;
    border-radius: 999px;
    border: 1px solid var(--landing-line, rgba(19, 17, 16, 0.14));
    background: rgba(255, 255, 255, 0.72);
    color: var(--landing-ink-soft, #272626);
    font-size: 0.84rem;
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
  }

  .engine-signatures-section__proof-chip--dark {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(17, 17, 17, 0.92);
    color: rgba(251, 251, 249, 0.96);
  }

  .engine-signatures-section__body {
    display: grid;
    grid-template-columns: minmax(220px, 0.8fr) repeat(3, minmax(0, 1fr));
    gap: clamp(16px, 2vw, 22px);
    margin-top: clamp(24px, 3vw, 38px);
    align-items: stretch;
  }

  .engine-signatures-section__editorial {
    display: grid;
    grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
    gap: 16px;
    min-width: 0;
    align-self: stretch;
  }

  .engine-signatures-section__card {
    display: grid;
    gap: 16px;
    align-content: start;
    min-height: 0;
    padding: clamp(18px, 2vw, 24px);
    border-radius: 28px;
    border: 1px solid var(--landing-line, rgba(19, 17, 16, 0.14));
    background: rgba(255, 255, 255, 0.76);
    box-shadow: 0 16px 36px rgba(19, 17, 16, 0.04);
  }

  .engine-signatures-section__card--dark {
    border-color: rgba(255, 255, 255, 0.08);
    background:
      linear-gradient(180deg, rgba(19, 17, 16, 0.96) 0%, rgba(31, 29, 28, 0.94) 100%);
    color: rgba(251, 251, 249, 0.96);
    box-shadow: 0 20px 48px rgba(17, 17, 17, 0.18);
  }

  .engine-signatures-section__card--dark .engine-signatures-section__card-label,
  .engine-signatures-section__card--dark .engine-signatures-section__contract-item {
    color: rgba(251, 251, 249, 0.72);
  }

  .engine-signatures-section__card--dark .engine-signatures-section__lead {
    color: rgba(251, 251, 249, 0.94);
  }

  .engine-signatures-section__contract-list {
    display: grid;
    gap: 10px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .engine-signatures-section__contract-item {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--landing-ink-soft, #272626);
    font-size: 0.92rem;
    line-height: 1.5;
  }

  .engine-signatures-section__contract-item::before {
    content: "";
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: rgba(17, 17, 17, 0.84);
    box-shadow: 0 0 0 4px rgba(17, 17, 17, 0.08);
    flex: 0 0 auto;
  }

  .engine-signatures-section__card--dark .engine-signatures-section__contract-item::before {
    background: rgba(251, 251, 249, 0.96);
    box-shadow: 0 0 0 4px rgba(251, 251, 249, 0.08);
  }

  .engine-signatures-section__grid {
    display: contents;
  }

  .engine-signatures-section__panel {
    --panel-radius: 24px;
    --surface-radius: 20px;
    --surface-padding: 16px;
    --surface-gap: 12px;
    --scene-card-radius: 16px;
    --scene-card-padding: 12px;
    --scene-card-border: rgba(19, 17, 16, 0.10);
    --scene-card-background: rgba(255, 255, 255, 0.84);
    --stage-border: rgba(19, 17, 16, 0.10);
    --stage-background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.90) 0%, rgba(239, 239, 235, 0.96) 100%);
    --stage-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
    --stage-rail: rgba(17, 17, 17, 0.06);
    --stage-dot: rgba(17, 17, 17, 0.22);
    --fingerprint-background: rgba(17, 17, 17, 0.03);
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto auto;
    min-width: 0;
    height: 100%;
    padding: clamp(18px, 2vw, 22px);
    border-radius: 32px;
    border: 1px solid var(--landing-line-strong, rgba(19, 17, 16, 0.24));
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.86) 0%, rgba(247, 247, 244, 0.96) 100%);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.74),
      0 24px 44px rgba(17, 17, 17, 0.08);
    position: relative;
    overflow: hidden;
  }

  .engine-signatures-section__panel::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 1px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.72) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    pointer-events: none;
  }

  .engine-signatures-section__panel[data-engine="classic"] {
    --panel-radius: 16px;
    --surface-radius: 14px;
    --surface-padding: 14px;
    --surface-gap: 10px;
    --scene-card-radius: 12px;
    --scene-card-padding: 10px;
    --scene-card-border: rgba(17, 17, 17, 0.16);
    --scene-card-background: rgba(255, 255, 255, 0.88);
    --stage-border: rgba(17, 17, 17, 0.18);
    --stage-background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(233, 233, 231, 0.98) 100%);
    --stage-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.84),
      inset 0 0 0 1px rgba(17, 17, 17, 0.04);
    --stage-rail: rgba(17, 17, 17, 0.08);
    --stage-dot: rgba(17, 17, 17, 0.32);
    --fingerprint-background: rgba(17, 17, 17, 0.045);
  }

  .engine-signatures-section__panel[data-engine="modern"] {
    --panel-radius: 28px;
    --surface-radius: 24px;
    --surface-padding: 18px;
    --surface-gap: 14px;
    --scene-card-radius: 20px;
    --scene-card-padding: 14px;
    --scene-card-border: rgba(17, 17, 17, 0.09);
    --scene-card-background: rgba(255, 255, 255, 0.82);
    --stage-border: rgba(17, 17, 17, 0.10);
    --stage-background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(241, 241, 238, 0.96) 100%);
    --stage-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.86),
      0 20px 34px rgba(17, 17, 17, 0.06);
    --stage-rail: rgba(17, 17, 17, 0.05);
    --stage-dot: rgba(17, 17, 17, 0.20);
    --fingerprint-background: rgba(17, 17, 17, 0.028);
  }

  .engine-signatures-section__panel[data-engine="rustic"] {
    --panel-radius: 20px;
    --surface-radius: 18px;
    --surface-padding: 17px;
    --surface-gap: 16px;
    --scene-card-radius: 14px;
    --scene-card-padding: 13px;
    --scene-card-border: rgba(17, 17, 17, 0.08);
    --scene-card-background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.78) 0%, rgba(245, 245, 242, 0.90) 100%);
    --stage-border: rgba(17, 17, 17, 0.09);
    --stage-background:
      linear-gradient(180deg, rgba(250, 250, 248, 0.94) 0%, rgba(239, 239, 236, 0.96) 100%);
    --stage-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.78),
      0 18px 32px rgba(17, 17, 17, 0.05);
    --stage-rail: rgba(17, 17, 17, 0.04);
    --stage-dot: rgba(17, 17, 17, 0.18);
    --fingerprint-background: rgba(17, 17, 17, 0.022);
  }

  .engine-signatures-section__panel-head {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 14px;
    min-width: 0;
  }

  .engine-signatures-section__panel-copy {
    min-width: 0;
  }

  .engine-signatures-section__panel-kicker {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    color: var(--landing-subtle, #8d8b86);
  }

  .engine-signatures-section__panel-kicker::before {
    content: "";
    width: 24px;
    height: 1px;
    background: rgba(19, 17, 16, 0.16);
  }

  .engine-signatures-section__panel-name {
    display: flex;
    align-items: baseline;
    gap: 10px;
    color: var(--landing-ink, #131110);
    font-family:
      var(--showroom-font-display),
      "Iowan Old Style",
      "Palatino Linotype",
      Georgia,
      serif;
    font-size: clamp(1.3rem, 2vw, 1.65rem);
    line-height: 1;
    letter-spacing: -0.04em;
  }

  .engine-signatures-section__panel-index {
    color: var(--landing-subtle, #8d8b86);
    font-family:
      var(--font-geist-mono, "SFMono-Regular"),
      ui-monospace,
      monospace;
    font-size: 0.84rem;
    letter-spacing: 0.06em;
  }

  .engine-signatures-section__panel-posture {
    margin-top: 8px;
    color: var(--landing-muted, #666561);
    font-size: 0.96rem;
    line-height: 1.56;
  }

  .engine-signatures-section__panel-tag {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    min-height: 2rem;
    padding: 0.48rem 0.7rem;
    border-radius: 999px;
    border: 1px solid rgba(19, 17, 16, 0.12);
    background: rgba(255, 255, 255, 0.70);
    color: var(--landing-ink-soft, #272626);
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .engine-signatures-section__stage {
    display: grid;
    min-height: 0;
    margin-top: 20px;
    margin-bottom: 16px;
    padding: 12px;
    border-radius: var(--panel-radius);
    border: 1px solid var(--stage-border);
    background: rgba(255, 255, 255, 0.46);
  }

  .engine-signatures-section__browser-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 30px;
    padding: 0 10px;
    border-radius: calc(var(--panel-radius) - 4px);
    background: var(--stage-rail);
  }

  .engine-signatures-section__browser-bar span {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--stage-dot);
  }

  .engine-signatures-section__surface {
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr) auto;
    gap: var(--surface-gap);
    min-height: clamp(384px, 31vw, 430px);
    margin-top: 10px;
    padding: var(--surface-padding);
    border-radius: var(--surface-radius);
    border: 1px solid var(--stage-border);
    background: var(--stage-background);
    box-shadow: var(--stage-shadow);
  }

  .engine-signatures-section__surface-head {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 12px;
  }

  .engine-signatures-section__scene-title {
    color: var(--landing-ink, #131110);
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .engine-signatures-section__scene-subtitle {
    margin-top: 6px;
  }

  .engine-signatures-section__scene-status {
    display: inline-flex;
    align-items: center;
    min-height: 1.9rem;
    padding: 0.42rem 0.6rem;
    border-radius: 999px;
    border: 1px solid rgba(17, 17, 17, 0.08);
    background: rgba(255, 255, 255, 0.58);
    color: var(--landing-ink-soft, #272626);
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .engine-signatures-section__stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0;
    overflow: hidden;
    border-radius: 16px;
    border: 1px solid rgba(17, 17, 17, 0.07);
    background: rgba(255, 255, 255, 0.56);
  }

  .engine-signatures-section__stat {
    display: grid;
    gap: 4px;
    min-width: 0;
    padding: 11px 10px;
    border-right: 1px solid rgba(17, 17, 17, 0.07);
    background: transparent;
  }

  .engine-signatures-section__stat:last-child {
    border-right: 0;
  }

  .engine-signatures-section__stat-label {
    color: var(--landing-ink, #131110);
    font-family:
      var(--font-geist-mono, "SFMono-Regular"),
      ui-monospace,
      monospace;
    font-size: 0.9rem;
    font-weight: 700;
    line-height: 1.1;
  }

  .engine-signatures-section__items {
    display: grid;
    gap: var(--surface-gap);
    align-content: start;
  }

  .engine-signatures-section__item {
    display: grid;
    gap: 8px;
    min-height: 98px;
    padding: var(--scene-card-padding);
    border-radius: var(--scene-card-radius);
    border: 1px solid var(--scene-card-border);
    background: var(--scene-card-background);
  }

  .engine-signatures-section__item-title {
    color: var(--landing-ink, #131110);
    font-size: 0.92rem;
    font-weight: 700;
    line-height: 1.35;
  }

  .engine-signatures-section__item-detail {
    color: var(--landing-muted, #666561);
    font-size: 0.84rem;
    line-height: 1.55;
  }

  .engine-signatures-section__actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0;
    padding-top: 12px;
    border-top: 1px solid rgba(17, 17, 17, 0.08);
  }

  .engine-signatures-section__action {
    display: inline-flex;
    align-items: center;
    min-height: 0;
    padding: 0 10px 0 0;
    position: relative;
    color: var(--landing-subtle, #8d8b86);
    font-size: 0.71rem;
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .engine-signatures-section__action:not(:last-child)::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 0;
    width: 1px;
    height: 16px;
    background: rgba(17, 17, 17, 0.10);
    transform: translateY(-50%);
  }

  .engine-signatures-section__fingerprint {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0;
    margin: 0;
    overflow: hidden;
    border-radius: 16px;
    border: 1px solid rgba(17, 17, 17, 0.07);
    background: var(--fingerprint-background);
  }

  .engine-signatures-section__fingerprint-item {
    min-width: 0;
    padding: 12px 10px 13px;
    border-right: 1px solid rgba(17, 17, 17, 0.07);
    background: transparent;
  }

  .engine-signatures-section__fingerprint-item:last-child {
    border-right: 0;
  }

  .engine-signatures-section__fingerprint-label {
    display: block;
    margin-bottom: 6px;
  }

  .engine-signatures-section__fingerprint-value {
    color: var(--landing-ink, #131110);
    font-size: 0.88rem;
    font-weight: 700;
    line-height: 1.3;
  }

  .engine-signatures-section__panel-note {
    min-height: 4.1em;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid rgba(17, 17, 17, 0.08);
    color: var(--landing-muted, #666561);
    font-size: 0.88rem;
    line-height: 1.58;
  }

  @media (hover: hover) and (pointer: fine) {
    .engine-signatures-section__panel {
      transition:
        transform 220ms ease,
        box-shadow 220ms ease,
        border-color 220ms ease;
    }

    .engine-signatures-section__panel:hover {
      transform: translateY(-3px);
      border-color: rgba(19, 17, 16, 0.28);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.82),
        0 28px 52px rgba(17, 17, 17, 0.10);
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .engine-signatures-section__panel::after {
      content: "";
      position: absolute;
      inset: 0;
      background:
        linear-gradient(
          115deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.16) 42%,
          rgba(255, 255, 255, 0) 56%
        );
      transform: translateX(-120%);
      opacity: 0;
      pointer-events: none;
      animation: engine-signatures-section-sheen 11s ease-in-out infinite;
    }

    .engine-signatures-section__panel:nth-child(2)::after {
      animation-delay: 1.6s;
    }

    .engine-signatures-section__panel:nth-child(3)::after {
      animation-delay: 3.2s;
    }
  }

  @keyframes engine-signatures-section-sheen {
    0%,
    72%,
    100% {
      transform: translateX(-120%);
      opacity: 0;
    }

    80% {
      transform: translateX(140%);
      opacity: 1;
    }
  }

  @media (max-width: 1220px) {
    .engine-signatures-section__body {
      grid-template-columns: minmax(0, 1fr);
    }

    .engine-signatures-section__editorial {
      grid-template-rows: none;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .engine-signatures-section__grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: clamp(16px, 2vw, 20px);
    }
  }

  @media (max-width: 1080px) {
    .engine-signatures-section__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 840px) {
    .engine-signatures-section__header {
      grid-template-columns: minmax(0, 1fr);
    }

    .engine-signatures-section__summary-metrics {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .engine-signatures-section__editorial {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: 720px) {
    .engine-signatures-section__frame {
      padding: 18px;
      border-radius: 26px;
    }

    .engine-signatures-section__grid,
    .engine-signatures-section__summary-metrics,
    .engine-signatures-section__stats,
    .engine-signatures-section__fingerprint,
    .engine-signatures-section__actions {
      grid-template-columns: minmax(0, 1fr);
    }

    .engine-signatures-section__surface-head,
    .engine-signatures-section__panel-head {
      flex-direction: column;
      align-items: start;
    }

    .engine-signatures-section__panel-tag,
    .engine-signatures-section__scene-status {
      white-space: normal;
    }

    .engine-signatures-section__action {
      padding: 8px 0;
    }

    .engine-signatures-section__action:not(:last-child)::after {
      top: auto;
      right: auto;
      bottom: 0;
      width: 100%;
      height: 1px;
      transform: none;
    }

    .engine-signatures-section__stat,
    .engine-signatures-section__fingerprint-item {
      border-right: 0;
      border-bottom: 1px solid rgba(17, 17, 17, 0.07);
    }

    .engine-signatures-section__stat:last-child,
    .engine-signatures-section__fingerprint-item:last-child {
      border-bottom: 0;
    }
  }
`;

export function EngineSignaturesSection({
  className,
  description = 'One product scene, one information contract, and three renderer signatures that shift tone through rhythm, radius, chrome, and surface weight.',
  eyebrow = 'Renderer signatures',
  includeStyles = true,
  title = 'The same scene, read three different ways.',
}: EngineSignaturesSectionProps) {
  const rootClassName = ['engine-signatures-section', className]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={rootClassName} aria-labelledby="engine-signatures-section-title">
      {includeStyles ? <style>{engineSignaturesSectionStyles}</style> : null}

      <div className="engine-signatures-section__frame">
        <div className="engine-signatures-section__header">
          <div>
            <p className="engine-signatures-section__eyebrow">{eyebrow}</p>
            <h2
              className="engine-signatures-section__title"
              id="engine-signatures-section-title"
            >
              {title}
            </h2>
            <p className="engine-signatures-section__description">{description}</p>
          </div>

          <div className="engine-signatures-section__summary">
            <p className="engine-signatures-section__lead">
              The comparison is intentionally controlled: content, labels, and action flow stay
              fixed so the engine signature reads as authored visual posture instead of accidental
              drift.
            </p>
            <div
              aria-hidden="true"
              className="engine-signatures-section__summary-rule"
            />
            <div className="engine-signatures-section__summary-metrics">
              <div className="engine-signatures-section__summary-metric">
                <strong>Same scene</strong>
                <span>Approval queue, identical content map.</span>
              </div>
              <div className="engine-signatures-section__summary-metric">
                <strong>Same contract</strong>
                <span>Labels, actions, and hierarchy remain fixed.</span>
              </div>
              <div className="engine-signatures-section__summary-metric">
                <strong>Different signature</strong>
                <span>Density, radius, framing, and surface finish move.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="engine-signatures-section__proof-rail" aria-label="Comparison proof points">
          <p className="engine-signatures-section__proof-chip engine-signatures-section__proof-chip--dark">
            Same DS contract
          </p>
          <p className="engine-signatures-section__proof-chip">Classic sharpens the frame</p>
          <p className="engine-signatures-section__proof-chip">Modern opens the cadence</p>
          <p className="engine-signatures-section__proof-chip">Rustic lowers the chrome</p>
        </div>

        <div className="engine-signatures-section__body">
          <aside className="engine-signatures-section__editorial" aria-label="Comparison notes">
            <div className="engine-signatures-section__card">
              <p className="engine-signatures-section__card-label">Locked scene</p>
              <p className="engine-signatures-section__lead">
                A controlled comparison where hierarchy, labels, and action flow stay fixed.
              </p>
              <ul className="engine-signatures-section__contract-list">
                {CONTRACT_LOCKS.map((item) => (
                  <li className="engine-signatures-section__contract-item" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="engine-signatures-section__card engine-signatures-section__card--dark">
              <p className="engine-signatures-section__card-label">What the renderer moves</p>
              <p className="engine-signatures-section__lead">
                Signature should show up in the finish, not by rewriting the product story.
              </p>
              <ul className="engine-signatures-section__contract-list">
                {SIGNATURE_SHIFTS.map((item) => (
                  <li className="engine-signatures-section__contract-item" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="engine-signatures-section__grid">
            {ENGINE_SIGNATURES.map((engine) => (
              <article
                className="engine-signatures-section__panel"
                data-engine={engine.id}
                key={engine.id}
              >
                <header className="engine-signatures-section__panel-head">
                  <div className="engine-signatures-section__panel-copy">
                    <p className="engine-signatures-section__panel-kicker">
                      Renderer signature
                    </p>
                    <h3 className="engine-signatures-section__panel-name">
                      <span>{engine.name}</span>
                      <span className="engine-signatures-section__panel-index">
                        {engine.index}
                      </span>
                    </h3>
                    <p className="engine-signatures-section__panel-posture">
                      {engine.posture}
                    </p>
                  </div>

                  <p className="engine-signatures-section__panel-tag">Same scene</p>
                </header>

                <div className="engine-signatures-section__stage" aria-hidden="true">
                  <div className="engine-signatures-section__browser-bar">
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="engine-signatures-section__surface">
                    <div className="engine-signatures-section__surface-head">
                      <div>
                        <p className="engine-signatures-section__scene-title">
                          Approval queue
                        </p>
                        <p className="engine-signatures-section__scene-subtitle">
                          Same DS contract
                        </p>
                      </div>
                      <span className="engine-signatures-section__scene-status">
                        Renderer tone
                      </span>
                    </div>

                    <div className="engine-signatures-section__stats">
                      {SCENE_STATS.map((stat) => (
                        <div className="engine-signatures-section__stat" key={stat.detail}>
                          <span className="engine-signatures-section__stat-label">
                            {stat.label}
                          </span>
                          <span className="engine-signatures-section__stat-detail">
                            {stat.detail}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="engine-signatures-section__items">
                      {SCENE_ITEMS.map((item) => (
                        <div className="engine-signatures-section__item" key={item.title}>
                          <p className="engine-signatures-section__item-kicker">{item.kicker}</p>
                          <p className="engine-signatures-section__item-title">{item.title}</p>
                          <p className="engine-signatures-section__item-detail">
                            {item.detail}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="engine-signatures-section__actions">
                      <span className="engine-signatures-section__action">Review packet</span>
                      <span className="engine-signatures-section__action">Role alignment</span>
                      <span className="engine-signatures-section__action">Publish decision</span>
                    </div>
                  </div>
                </div>

                <dl className="engine-signatures-section__fingerprint">
                  {engine.fingerprint.map((metric) => (
                    <div
                      className="engine-signatures-section__fingerprint-item"
                      key={metric.label}
                    >
                      <dt className="engine-signatures-section__fingerprint-label">
                        {metric.label}
                      </dt>
                      <dd className="engine-signatures-section__fingerprint-value">
                        {metric.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="engine-signatures-section__panel-note">{engine.note}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
