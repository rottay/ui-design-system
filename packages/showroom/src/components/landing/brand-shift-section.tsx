import { ArrowUpRight } from 'lucide-react';
import { ShowroomLink as Link } from '@/components/showroom-link';

const SHIFT_DIMENSIONS = [
  {
    label: 'Palette',
    bridgeLabel: 'Palette',
    detail: 'Temperature, contrast, and emphasis shift together.',
    before: 'Accent swap on a neutral shell.',
    after: 'A brand-owned grayscale with authored contrast.',
  },
  {
    label: 'Surface treatment',
    bridgeLabel: 'Surface',
    detail: 'Paper, glass, and layering change the perceived finish.',
    before: 'Flat white cards with generic panels.',
    after: 'Layered off-white surfaces with premium depth.',
  },
  {
    label: 'Chrome',
    bridgeLabel: 'Chrome',
    detail: 'Framing, strokes, and control hardware set the posture.',
    before: 'Utility borders and stock controls.',
    after: 'Quiet chrome tuned to the product voice.',
  },
  {
    label: 'Radius',
    bridgeLabel: 'Radius',
    detail: 'Corners become a recognizable silhouette system-wide.',
    before: 'One-size edge treatment.',
    after: 'A distinct edge language across every surface.',
  },
  {
    label: 'Density',
    bridgeLabel: 'Density',
    detail: 'Spacing tempo decides whether the product feels rushed or composed.',
    before: 'Compressed rhythm and tactical stacking.',
    after: 'Air, cadence, and breathing room that feel intentional.',
  },
  {
    label: 'Motion',
    bridgeLabel: 'Motion',
    detail: 'Timing and easing finish the impression once the screen moves.',
    before: 'Default transitions and generic easing.',
    after: 'Calm cues with a branded sense of hush.',
  },
] as const;

const SYSTEM_REACH = [
  {
    label: 'Tokens',
    detail: 'Corners, contrast, surface weights, and motion curves set the new voice.',
  },
  {
    label: 'Components',
    detail: 'Buttons, inputs, cards, overlays, and nav all inherit the same finish.',
  },
  {
    label: 'Patterns',
    detail: 'Workflows keep the same contract while the brand changes the reading pace.',
  },
  {
    label: 'Surfaces',
    detail: 'Whole routes land with a clear product signature instead of a recolored shell.',
  },
] as const;

const SURFACE_METRICS = {
  before: [
    { label: 'Chrome', value: 'utility first' },
    { label: 'Radius', value: '12 px' },
    { label: 'Density', value: 'tight' },
  ],
  after: [
    { label: 'Chrome', value: 'quiet frame' },
    { label: 'Radius', value: '26 px' },
    { label: 'Density', value: 'editorial' },
  ],
} as const;

const WORKFLOW_ITEMS = [
  'Review candidate packet',
  'Confirm role alignment',
  'Publish decision notes',
] as const;

const MOTION_LABELS = ['cue', 'settle', 'linger'] as const;

const AUTHORSHIP_LEDGER = [
  {
    label: 'Paint only',
    title: 'Brand lands on top of an inherited shell.',
    detail: 'Accent changes first. Surface, chrome, radius, density, and motion still read as default.',
  },
  {
    label: 'Full shift',
    title: 'Brand lands underneath the whole screen.',
    detail:
      'Palette, surface finish, chrome, spacing, and motion move together while the contract stays intact.',
  },
] as const;

const SIGNATURE_TAGS = {
  before: ['accent only', 'same shell', 'generic easing'],
  after: ['full shift', 'same contract', 'authored hush'],
} as const;

const RAIL_METRICS = [
  { label: 'Dimensions', value: '6' },
  { label: 'Layers', value: '4' },
  { label: 'Contract', value: 'stable' },
] as const;

type BrandShiftSectionProps = {
  className?: string;
  includeCss?: boolean;
};

export const brandShiftSectionCss = `
  .brand-shift {
    position: relative;
    overflow: hidden;
    padding: clamp(28px, 4vw, 44px);
    border-radius: 32px;
    border: 1px solid var(--landing-line, rgba(19, 17, 16, 0.14));
    background:
      radial-gradient(circle at top right, rgba(19, 17, 16, 0.08) 0%, transparent 28%),
      radial-gradient(circle at bottom left, rgba(19, 17, 16, 0.06) 0%, transparent 30%),
      linear-gradient(180deg, rgba(251, 251, 249, 0.97) 0%, rgba(240, 239, 235, 0.95) 100%);
    box-shadow: var(--landing-shadow, 0 22px 56px rgba(19, 17, 16, 0.08));
    isolation: isolate;
  }

  .brand-shift * {
    box-sizing: border-box;
  }

  .brand-shift::before,
  .brand-shift::after {
    content: '';
    position: absolute;
    inset: auto;
    pointer-events: none;
    z-index: 0;
  }

  .brand-shift::before {
    top: 18px;
    left: 18px;
    right: 18px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(19, 17, 16, 0.16), transparent);
  }

  .brand-shift::after {
    right: -88px;
    bottom: -120px;
    width: 320px;
    height: 320px;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(19, 17, 16, 0.12) 0%, transparent 68%);
    opacity: 0.36;
  }

  .brand-shift__inner {
    position: relative;
    z-index: 1;
  }

  .brand-shift__intro {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
    gap: 24px;
    align-items: end;
  }

  .brand-shift__eyebrow,
  .brand-shift__mini-label,
  .brand-shift__screen-label,
  .brand-shift__axis-label,
  .brand-shift__ledger-label,
  .brand-shift__reach-kicker,
  .brand-shift__reach-label,
  .brand-shift__metric-label,
  .brand-shift__workflow-label,
  .brand-shift__rail-metric-label,
  .brand-shift__dimension-index {
    margin: 0;
    color: var(--landing-subtle, #7c7a75);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .brand-shift__title {
    margin: 14px 0 0;
    max-width: 14ch;
    color: var(--landing-ink-soft, #201e1c);
    font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
    font-size: clamp(2.35rem, 4.2vw, 4.45rem);
    line-height: 0.92;
    letter-spacing: -0.065em;
  }

  .brand-shift__copy {
    margin: 0;
    color: var(--landing-muted, #5f5d58);
    font-size: 1.05rem;
    line-height: 1.72;
  }

  .brand-shift__canvas {
    display: grid;
    grid-template-columns: minmax(0, 1.38fr) minmax(320px, 0.88fr);
    gap: 20px;
    margin-top: 30px;
  }

  .brand-shift__stage,
  .brand-shift__rail {
    position: relative;
    overflow: hidden;
    min-width: 0;
    border-radius: 28px;
    border: 1px solid var(--landing-line, rgba(19, 17, 16, 0.14));
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.82) 0%, rgba(244, 244, 241, 0.92) 100%);
  }

  .brand-shift__stage {
    padding: 20px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.58);
  }

  .brand-shift__stage::before,
  .brand-shift__rail::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .brand-shift__stage::before {
    background:
      linear-gradient(130deg, rgba(255, 255, 255, 0.54) 0%, transparent 34%),
      radial-gradient(circle at top right, rgba(19, 17, 16, 0.08) 0%, transparent 24%);
  }

  .brand-shift__rail::before {
    background:
      radial-gradient(circle at top left, rgba(19, 17, 16, 0.08) 0%, transparent 28%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, transparent 45%);
  }

  .brand-shift__stage-head {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 20px;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--landing-line, rgba(19, 17, 16, 0.14));
  }

  .brand-shift__stage-title {
    margin: 10px 0 0;
    max-width: 16ch;
    color: var(--landing-ink-soft, #201e1c);
    font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
    font-size: clamp(1.6rem, 2.6vw, 2.4rem);
    line-height: 1.02;
    letter-spacing: -0.05em;
  }

  .brand-shift__stage-note {
    max-width: 28ch;
    margin: 0;
    color: var(--landing-muted, #5f5d58);
    font-size: 0.96rem;
    line-height: 1.66;
    text-align: right;
  }

  .brand-shift__stage-ledger {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
  }

  .brand-shift__ledger-card {
    display: grid;
    gap: 8px;
    min-width: 0;
    padding: 16px;
    border-radius: 18px;
    border: 1px solid rgba(19, 17, 16, 0.1);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.84) 0%, rgba(246, 245, 242, 0.94) 100%);
  }

  .brand-shift__ledger-card--after {
    box-shadow:
      0 18px 40px rgba(19, 17, 16, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.72);
  }

  .brand-shift__ledger-title {
    margin: 0;
    color: var(--landing-ink-soft, #201e1c);
    font-size: 1.02rem;
    line-height: 1.24;
    letter-spacing: -0.03em;
  }

  .brand-shift__ledger-detail {
    margin: 0;
    color: var(--landing-muted, #5f5d58);
    font-size: 0.84rem;
    line-height: 1.58;
  }

  .brand-shift__compare {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 104px minmax(0, 1fr);
    gap: 16px;
    align-items: stretch;
    margin-top: 18px;
    padding-top: 18px;
    border-top: 1px solid rgba(19, 17, 16, 0.1);
  }

  .brand-shift__screen {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
    padding: 18px;
    border-radius: 24px;
  }

  .brand-shift__screen--before {
    border: 1px solid rgba(19, 17, 16, 0.18);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.86) 0%, rgba(245, 244, 240, 0.94) 100%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.54);
  }

  .brand-shift__screen--after {
    border: 1px solid rgba(19, 17, 16, 0.12);
    background:
      radial-gradient(circle at top right, rgba(19, 17, 16, 0.12) 0%, transparent 26%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(239, 238, 234, 0.96) 100%);
    box-shadow:
      0 24px 56px rgba(19, 17, 16, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.76);
  }

  .brand-shift__screen-head {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 14px;
    border-bottom: 1px solid rgba(19, 17, 16, 0.1);
  }

  .brand-shift__screen-title {
    margin: 6px 0 0;
    color: var(--landing-ink-soft, #201e1c);
    font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
    font-size: 1.22rem;
    line-height: 1.08;
    letter-spacing: -0.04em;
  }

  .brand-shift__screen-copy {
    margin: 8px 0 0;
    color: var(--landing-muted, #5f5d58);
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .brand-shift__screen-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 30px;
    padding: 6px 12px;
    border-radius: 999px;
    border: 1px solid rgba(19, 17, 16, 0.12);
    color: var(--landing-ink-soft, #201e1c);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .brand-shift__screen--after .brand-shift__screen-pill {
    background: rgba(19, 17, 16, 0.92);
    border-color: rgba(19, 17, 16, 0.86);
    color: rgba(251, 251, 249, 0.92);
    box-shadow: 0 10px 24px rgba(19, 17, 16, 0.16);
  }

  .brand-shift__window {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 14px;
    border: 1px solid rgba(19, 17, 16, 0.12);
    background: rgba(19, 17, 16, 0.035);
  }

  .brand-shift__window-top {
    display: grid;
    gap: 14px;
  }

  .brand-shift__screen--before .brand-shift__window {
    border-radius: 14px;
  }

  .brand-shift__screen--after .brand-shift__window {
    border-radius: 28px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.78) 0%, rgba(242, 241, 237, 0.82) 100%),
      rgba(19, 17, 16, 0.04);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.64);
  }

  .brand-shift__screen--after .brand-shift__window::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, transparent 18%, rgba(255, 255, 255, 0.52) 42%, transparent 68%);
    transform: translateX(-55%);
    animation: brandShiftSweep 7.4s cubic-bezier(0.22, 1, 0.36, 1) infinite;
    pointer-events: none;
  }

  .brand-shift__screen-section {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 10px;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid rgba(19, 17, 16, 0.08);
  }

  .brand-shift__browser {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: var(--landing-subtle, #7c7a75);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .brand-shift__browser-dots {
    display: flex;
    gap: 6px;
  }

  .brand-shift__browser-dots span {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: rgba(19, 17, 16, 0.36);
  }

  .brand-shift__hero {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    align-items: end;
    padding: 16px;
    border: 1px solid rgba(19, 17, 16, 0.12);
    background: rgba(255, 255, 255, 0.82);
  }

  .brand-shift__screen--before .brand-shift__hero {
    border-radius: 12px;
  }

  .brand-shift__screen--after .brand-shift__hero {
    border-radius: 24px;
    background:
      radial-gradient(circle at top right, rgba(19, 17, 16, 0.12) 0%, transparent 32%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(242, 241, 236, 0.94) 100%);
  }

  .brand-shift__hero-title {
    margin: 8px 0 0;
    color: var(--landing-ink-soft, #201e1c);
    font-size: 1.12rem;
    line-height: 1.08;
    letter-spacing: -0.04em;
  }

  .brand-shift__hero-copy {
    margin: 8px 0 0;
    color: var(--landing-muted, #5f5d58);
    font-size: 0.88rem;
    line-height: 1.58;
  }

  .brand-shift__hero-stat {
    min-width: 92px;
    padding: 12px 14px;
    border: 1px solid rgba(19, 17, 16, 0.12);
    text-align: center;
  }

  .brand-shift__screen--before .brand-shift__hero-stat {
    border-radius: 12px;
  }

  .brand-shift__screen--after .brand-shift__hero-stat {
    border-radius: 22px;
    background: rgba(19, 17, 16, 0.92);
    border-color: rgba(19, 17, 16, 0.92);
    color: rgba(251, 251, 249, 0.92);
    box-shadow: 0 16px 32px rgba(19, 17, 16, 0.12);
  }

  .brand-shift__hero-value {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 0.95;
    letter-spacing: -0.06em;
  }

  .brand-shift__hero-caption {
    display: block;
    margin-top: 6px;
    font-size: 0.68rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .brand-shift__metric-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .brand-shift__metric {
    padding: 12px;
    border: 1px solid rgba(19, 17, 16, 0.1);
    background: rgba(255, 255, 255, 0.76);
  }

  .brand-shift__screen--before .brand-shift__metric {
    border-radius: 12px;
  }

  .brand-shift__screen--after .brand-shift__metric {
    border-radius: 20px;
  }

  .brand-shift__metric-value {
    display: block;
    margin-top: 6px;
    color: var(--landing-ink-soft, #201e1c);
    font-size: 0.92rem;
    font-weight: 600;
    line-height: 1.36;
    letter-spacing: -0.02em;
  }

  .brand-shift__workflow {
    display: grid;
    gap: 9px;
  }

  .brand-shift__workflow-item {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 0 14px;
    border: 1px solid rgba(19, 17, 16, 0.14);
    color: var(--landing-ink-soft, #201e1c);
    background: rgba(255, 255, 255, 0.82);
    font-size: 0.9rem;
    line-height: 1.3;
  }

  .brand-shift__screen--before .brand-shift__workflow-item {
    border-radius: 999px;
  }

  .brand-shift__screen--after .brand-shift__workflow-item {
    border-radius: 18px;
    box-shadow: 0 10px 22px rgba(19, 17, 16, 0.05);
  }

  .brand-shift__workflow-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: rgba(19, 17, 16, 0.4);
    flex: 0 0 auto;
  }

  .brand-shift__screen--after .brand-shift__workflow-dot {
    background: rgba(19, 17, 16, 0.92);
    box-shadow: 0 0 0 6px rgba(19, 17, 16, 0.08);
  }

  .brand-shift__motion {
    display: grid;
    gap: 10px;
    margin-top: 0;
  }

  .brand-shift__motion-track {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .brand-shift__motion-track::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
    background: linear-gradient(90deg, rgba(19, 17, 16, 0.16), rgba(19, 17, 16, 0.04));
    transform: translateY(-50%);
  }

  .brand-shift__motion-node {
    position: relative;
    display: grid;
    place-items: center;
    min-height: 34px;
    padding: 8px 10px;
    border: 1px solid rgba(19, 17, 16, 0.12);
    background: rgba(255, 255, 255, 0.8);
    color: var(--landing-subtle, #7c7a75);
    font-size: 0.66rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .brand-shift__screen--before .brand-shift__motion-node {
    border-radius: 999px;
  }

  .brand-shift__screen--after .brand-shift__motion-node {
    border-radius: 16px;
  }

  .brand-shift__screen--after .brand-shift__motion-node--active {
    color: rgba(251, 251, 249, 0.92);
    background: rgba(19, 17, 16, 0.92);
    border-color: rgba(19, 17, 16, 0.92);
    box-shadow: 0 14px 26px rgba(19, 17, 16, 0.14);
    animation: brandShiftPulse 3.6s ease-in-out infinite;
  }

  .brand-shift__axis {
    position: relative;
    display: grid;
    justify-content: center;
    justify-items: center;
    gap: 12px;
    min-width: 0;
    padding: 8px 0;
  }

  .brand-shift__axis::before {
    content: '';
    position: absolute;
    top: 12px;
    bottom: 12px;
    left: 50%;
    width: 1px;
    background: linear-gradient(180deg, transparent, rgba(19, 17, 16, 0.2) 18%, rgba(19, 17, 16, 0.08) 82%, transparent);
    transform: translateX(-50%);
  }

  .brand-shift__axis-header {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 6px;
    justify-items: center;
  }

  .brand-shift__axis-label {
    text-align: center;
  }

  .brand-shift__axis-caption {
    margin: 0;
    max-width: 12ch;
    color: var(--landing-subtle, #7c7a75);
    font-size: 0.72rem;
    line-height: 1.48;
    text-align: center;
  }

  .brand-shift__axis-track {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 100%;
  }

  .brand-shift__axis-pill {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 30px;
    max-width: 100%;
    padding: 7px 10px;
    border-radius: 999px;
    border: 1px solid rgba(19, 17, 16, 0.12);
    background: rgba(251, 251, 249, 0.82);
    color: var(--landing-ink-soft, #201e1c);
    font-size: 0.66rem;
    font-weight: 700;
    letter-spacing: 0.11em;
    text-transform: uppercase;
    text-align: center;
    white-space: nowrap;
    backdrop-filter: blur(8px);
    box-shadow:
      0 8px 18px rgba(19, 17, 16, 0.035),
      inset 0 1px 0 rgba(255, 255, 255, 0.64);
  }

  .brand-shift__reach {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 16px;
  }

  .brand-shift__reach-shell {
    position: relative;
    z-index: 1;
    margin-top: 18px;
    padding-top: 18px;
    border-top: 1px solid rgba(19, 17, 16, 0.1);
  }

  .brand-shift__reach-head {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 18px;
  }

  .brand-shift__reach-title {
    margin: 8px 0 0;
    color: var(--landing-ink-soft, #201e1c);
    font-size: 1.12rem;
    line-height: 1.18;
    letter-spacing: -0.03em;
  }

  .brand-shift__reach-note {
    max-width: 34ch;
    margin: 0;
    color: var(--landing-muted, #5f5d58);
    font-size: 0.88rem;
    line-height: 1.58;
    text-align: right;
  }

  .brand-shift__reach-card {
    display: grid;
    gap: 10px;
    min-width: 0;
    padding: 14px;
    border-radius: 18px;
    border: 1px solid rgba(19, 17, 16, 0.12);
    background: rgba(255, 255, 255, 0.72);
  }

  .brand-shift__reach-copy {
    margin: 0;
    color: var(--landing-muted, #5f5d58);
    font-size: 0.86rem;
    line-height: 1.56;
  }

  .brand-shift__rail {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 14px;
    padding: 18px;
  }

  .brand-shift__lead {
    display: grid;
    gap: 12px;
    padding: 16px;
    border-radius: 22px;
    border: 1px solid rgba(19, 17, 16, 0.12);
    background:
      linear-gradient(180deg, rgba(19, 17, 16, 0.96) 0%, rgba(35, 34, 32, 0.96) 100%);
    color: rgba(251, 251, 249, 0.92);
  }

  .brand-shift__lead .brand-shift__mini-label {
    color: rgba(251, 251, 249, 0.58);
  }

  .brand-shift__lead-title {
    margin: 0;
    max-width: 15ch;
    font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
    font-size: 1.6rem;
    line-height: 1.02;
    letter-spacing: -0.05em;
  }

  .brand-shift__lead-copy {
    margin: 0;
    max-width: 27ch;
    color: rgba(251, 251, 249, 0.76);
    font-size: 0.94rem;
    line-height: 1.64;
  }

  .brand-shift__rail-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .brand-shift__rail-metric {
    display: grid;
    gap: 6px;
    min-width: 0;
    padding: 12px;
    border-radius: 18px;
    border: 1px solid rgba(19, 17, 16, 0.1);
    background: rgba(255, 255, 255, 0.74);
  }

  .brand-shift__rail-metric-value {
    display: block;
    color: var(--landing-ink-soft, #201e1c);
    font-size: 1.18rem;
    font-weight: 700;
    line-height: 0.96;
    letter-spacing: -0.04em;
  }

  .brand-shift__rail-section-head {
    display: grid;
    gap: 8px;
    padding-top: 6px;
    border-top: 1px solid rgba(19, 17, 16, 0.1);
  }

  .brand-shift__rail-section-title {
    margin: 0;
    color: var(--landing-ink-soft, #201e1c);
    font-size: 1.02rem;
    line-height: 1.24;
    letter-spacing: -0.03em;
  }

  .brand-shift__rail-section-copy {
    margin: 0;
    color: var(--landing-muted, #5f5d58);
    font-size: 0.88rem;
    line-height: 1.58;
  }

  .brand-shift__dimension-list {
    display: grid;
    gap: 10px;
  }

  .brand-shift__dimension {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 12px;
    align-items: start;
    padding: 14px;
    border-radius: 18px;
    border: 1px solid rgba(19, 17, 16, 0.1);
    background: rgba(255, 255, 255, 0.74);
  }

  .brand-shift__dimension-index {
    min-width: 2.6rem;
    padding-top: 2px;
  }

  .brand-shift__dimension-label {
    margin: 0;
    color: var(--landing-ink-soft, #201e1c);
    font-size: 0.98rem;
    font-weight: 700;
    line-height: 1.24;
    letter-spacing: -0.02em;
  }

  .brand-shift__dimension-detail {
    margin: 6px 0 0;
    color: var(--landing-muted, #5f5d58);
    font-size: 0.86rem;
    line-height: 1.56;
  }

  .brand-shift__dimension-shift {
    margin: 10px 0 0;
    color: var(--landing-subtle, #7c7a75);
    font-size: 0.78rem;
    line-height: 1.54;
  }

  .brand-shift__dimension-shift strong {
    color: var(--landing-ink-soft, #201e1c);
    font-weight: 700;
  }

  .brand-shift__signature-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .brand-shift__signature-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 30px;
    padding: 0 11px;
    border-radius: 999px;
    border: 1px solid rgba(19, 17, 16, 0.1);
    background: rgba(255, 255, 255, 0.76);
    color: var(--landing-subtle, #7c7a75);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .brand-shift__screen--after .brand-shift__signature-tag {
    background: rgba(19, 17, 16, 0.92);
    border-color: rgba(19, 17, 16, 0.92);
    color: rgba(251, 251, 249, 0.92);
    box-shadow: 0 10px 18px rgba(19, 17, 16, 0.1);
  }

  .brand-shift__links {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 2px;
  }

  .brand-shift__link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 38px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid rgba(19, 17, 16, 0.12);
    color: var(--landing-ink-soft, #201e1c);
    background: rgba(255, 255, 255, 0.78);
    text-decoration: none;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    transition:
      transform 180ms ease,
      border-color 180ms ease,
      background 180ms ease,
      color 180ms ease;
  }

  .brand-shift__link:hover {
    transform: translateY(-1px);
    border-color: rgba(19, 17, 16, 0.2);
    background: rgba(19, 17, 16, 0.92);
    color: rgba(251, 251, 249, 0.92);
  }

  .brand-shift__link:focus-visible {
    outline: 2px solid rgba(19, 17, 16, 0.5);
    outline-offset: 2px;
  }

  @keyframes brandShiftSweep {
    0% {
      transform: translateX(-55%);
      opacity: 0;
    }

    18% {
      opacity: 0.85;
    }

    46% {
      opacity: 0.85;
    }

    70%,
    100% {
      transform: translateX(68%);
      opacity: 0;
    }
  }

  @keyframes brandShiftPulse {
    0%,
    100% {
      transform: translateY(0);
      box-shadow: 0 14px 26px rgba(19, 17, 16, 0.14);
    }

    50% {
      transform: translateY(-1px);
      box-shadow: 0 18px 30px rgba(19, 17, 16, 0.18);
    }
  }

  @media (max-width: 1180px) {
    .brand-shift__intro,
    .brand-shift__canvas {
      grid-template-columns: 1fr;
    }

    .brand-shift__stage-ledger {
      grid-template-columns: 1fr;
    }

    .brand-shift__title {
      max-width: 18ch;
    }

    .brand-shift__copy,
    .brand-shift__stage-note,
    .brand-shift__reach-note {
      max-width: 60ch;
      text-align: left;
    }
  }

  @media (max-width: 980px) {
    .brand-shift__compare {
      grid-template-columns: 1fr;
    }

    .brand-shift__axis {
      justify-items: start;
      gap: 10px;
      padding: 6px 0 2px;
    }

    .brand-shift__axis::before {
      top: auto;
      bottom: 22px;
      left: 0;
      right: 0;
      width: auto;
      height: 1px;
      transform: none;
    }

    .brand-shift__axis-header {
      justify-items: start;
    }

    .brand-shift__axis-caption,
    .brand-shift__axis-label {
      text-align: left;
    }

    .brand-shift__axis-track {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: flex-start;
    }

    .brand-shift__reach {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 720px) {
    .brand-shift {
      padding: 24px;
      border-radius: 26px;
    }

    .brand-shift__stage,
    .brand-shift__rail {
      border-radius: 24px;
    }

    .brand-shift__stage-head,
    .brand-shift__screen-head,
    .brand-shift__hero,
    .brand-shift__reach-head {
      grid-template-columns: 1fr;
      align-items: start;
    }

    .brand-shift__stage-head,
    .brand-shift__screen-head,
    .brand-shift__reach-head {
      display: grid;
    }

    .brand-shift__screen-pill {
      justify-self: start;
    }

    .brand-shift__metric-grid,
    .brand-shift__reach,
    .brand-shift__rail-metrics {
      grid-template-columns: 1fr;
    }

    .brand-shift__dimension {
      grid-template-columns: 1fr;
    }

    .brand-shift__dimension-index {
      padding-top: 0;
    }

    .brand-shift__axis {
      gap: 8px;
    }
  }
`;

function BrandShiftLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link className="brand-shift__link" href={href}>
      <span>{label}</span>
      <ArrowUpRight size={14} strokeWidth={1.8} />
    </Link>
  );
}

function BrandSurfacePreview({
  tone,
}: {
  tone: 'before' | 'after';
}) {
  const isAfter = tone === 'after';
  const metrics = isAfter ? SURFACE_METRICS.after : SURFACE_METRICS.before;
  const signatureTags = isAfter ? SIGNATURE_TAGS.after : SIGNATURE_TAGS.before;

  return (
    <article className={`brand-shift__screen brand-shift__screen--${tone}`}>
      <header className="brand-shift__screen-head">
        <div>
          <p className="brand-shift__screen-label">{isAfter ? 'After' : 'Before'}</p>
          <h3 className="brand-shift__screen-title">
            {isAfter ? 'Authored runtime finish' : 'Accent-led recolor'}
          </h3>
          <p className="brand-shift__screen-copy">
            {isAfter
              ? 'The same product contract gains a new tone, new edge feel, and a calmer pace.'
              : 'Palette changes, but the rest of the experience still feels inherited.'}
          </p>
        </div>
        <span className="brand-shift__screen-pill">{isAfter ? 'full shift' : 'paint only'}</span>
      </header>

      <div className="brand-shift__window">
        <div className="brand-shift__window-top">
          <div className="brand-shift__browser">
            <span>{isAfter ? 'Studio tenant' : 'Default tenant'}</span>
            <div aria-hidden="true" className="brand-shift__browser-dots">
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="brand-shift__hero">
            <div>
              <p className="brand-shift__mini-label">
                {isAfter ? 'Quiet premium signal' : 'Accent-level signal'}
              </p>
              <h4 className="brand-shift__hero-title">Decision center</h4>
              <p className="brand-shift__hero-copy">
                Same module, same hierarchy, different atmosphere once the runtime owns the
                finish.
              </p>
            </div>

            <div className="brand-shift__hero-stat">
              <span className="brand-shift__hero-value">28h</span>
              <span className="brand-shift__hero-caption">turnaround</span>
            </div>
          </div>
        </div>

        <div className="brand-shift__screen-section">
          <p className="brand-shift__workflow-label">Surface fingerprint</p>
          <div className="brand-shift__metric-grid">
            {metrics.map((metric) => (
              <div className="brand-shift__metric" key={metric.label}>
                <span className="brand-shift__metric-label">{metric.label}</span>
                <span className="brand-shift__metric-value">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="brand-shift__screen-section brand-shift__workflow">
          <p className="brand-shift__workflow-label">Workflow lane</p>
          {WORKFLOW_ITEMS.map((item) => (
            <div className="brand-shift__workflow-item" key={item}>
              <span aria-hidden="true" className="brand-shift__workflow-dot" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="brand-shift__screen-section brand-shift__motion">
          <p className="brand-shift__workflow-label">Motion cue</p>
          <div className="brand-shift__motion-track" aria-hidden="true">
            {MOTION_LABELS.map((label, index) => (
              <span
                className={[
                  'brand-shift__motion-node',
                  isAfter && index === 1 ? 'brand-shift__motion-node--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={label}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="brand-shift__screen-section">
          <p className="brand-shift__workflow-label">Authorship read</p>
          <div className="brand-shift__signature-strip">
            {signatureTags.map((tag) => (
              <span className="brand-shift__signature-tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export function BrandShiftSection({
  className,
  includeCss = true,
}: BrandShiftSectionProps) {
  const rootClassName = ['brand-shift', className].filter(Boolean).join(' ');

  return (
    <>
      {includeCss ? <style>{brandShiftSectionCss}</style> : null}

      <section className={rootClassName}>
        <div className="brand-shift__inner">
          <div className="brand-shift__intro">
            <div>
              <p className="brand-shift__eyebrow">White-label range</p>
              <h2 className="brand-shift__title">
                Brand should restyle the atmosphere, not just the accent.
              </h2>
            </div>

            <p className="brand-shift__copy">
              Palette, surface treatment, chrome, radius, density, and motion should travel
              together. If identity only touches color, the product still feels borrowed.
            </p>
          </div>

          <div className="brand-shift__canvas">
            <article className="brand-shift__stage">
              <div className="brand-shift__stage-head">
                <div>
                  <p className="brand-shift__mini-label">Brand shift on a live contract</p>
                  <h3 className="brand-shift__stage-title">
                    The same screen can read inherited or fully authored.
                  </h3>
                </div>

                <p className="brand-shift__stage-note">
                  Before and after should not change product logic. They should change posture,
                  finish, and the way the system carries brand through every layer.
                </p>
              </div>

              <div className="brand-shift__stage-ledger">
                {AUTHORSHIP_LEDGER.map((item, index) => (
                  <div
                    className={[
                      'brand-shift__ledger-card',
                      index === 1 ? 'brand-shift__ledger-card--after' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    key={item.label}
                  >
                    <p className="brand-shift__ledger-label">{item.label}</p>
                    <p className="brand-shift__ledger-title">{item.title}</p>
                    <p className="brand-shift__ledger-detail">{item.detail}</p>
                  </div>
                ))}
              </div>

              <div className="brand-shift__compare">
                <BrandSurfacePreview tone="before" />

                <div className="brand-shift__axis" aria-label="Shift dimensions">
                  <div className="brand-shift__axis-header">
                    <p className="brand-shift__axis-label">What moves</p>
                    <p className="brand-shift__axis-caption">
                      The contract stays. The finish changes together.
                    </p>
                  </div>

                  <div className="brand-shift__axis-track">
                    {SHIFT_DIMENSIONS.map((dimension) => (
                      <span className="brand-shift__axis-pill" key={dimension.label}>
                        {dimension.bridgeLabel}
                      </span>
                    ))}
                  </div>
                </div>

                <BrandSurfacePreview tone="after" />
              </div>

              <div className="brand-shift__reach-shell">
                <div className="brand-shift__reach-head">
                  <div>
                    <p className="brand-shift__reach-kicker">What carries the shift</p>
                    <p className="brand-shift__reach-title">
                      The authored feel has to survive beyond the hero.
                    </p>
                  </div>

                  <p className="brand-shift__reach-note">
                    Tokens set the tone, components hold the signature, and full surfaces keep the
                    same authored posture at route level.
                  </p>
                </div>

                <div className="brand-shift__reach">
                  {SYSTEM_REACH.map((item) => (
                    <div className="brand-shift__reach-card" key={item.label}>
                      <p className="brand-shift__reach-label">{item.label}</p>
                      <p className="brand-shift__reach-copy">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <aside className="brand-shift__rail">
              <div className="brand-shift__lead">
                <p className="brand-shift__mini-label">Brand thesis</p>
                <h3 className="brand-shift__lead-title">
                  White-label only feels premium when the whole system moves.
                </h3>
                <p className="brand-shift__lead-copy">
                  A real brand shift changes atmosphere, control feel, cadence, and motion without
                  re-teaching the product what it is.
                </p>
              </div>

              <div className="brand-shift__rail-metrics">
                {RAIL_METRICS.map((item) => (
                  <div className="brand-shift__rail-metric" key={item.label}>
                    <p className="brand-shift__rail-metric-label">{item.label}</p>
                    <span className="brand-shift__rail-metric-value">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="brand-shift__rail-section-head">
                <p className="brand-shift__reach-kicker">What moves together</p>
                <p className="brand-shift__rail-section-title">
                  Premium range comes from separating paint from authorship.
                </p>
                <p className="brand-shift__rail-section-copy">
                  The screen should read differently because the system underneath changed, not
                  because a neutral layout received a new accent.
                </p>
              </div>

              <div className="brand-shift__dimension-list">
                {SHIFT_DIMENSIONS.map((dimension, index) => (
                  <div className="brand-shift__dimension" key={dimension.label}>
                    <div className="brand-shift__dimension-index">
                      {`${index + 1}`.padStart(2, '0')}
                    </div>
                    <div>
                      <p className="brand-shift__dimension-label">{dimension.label}</p>
                      <p className="brand-shift__dimension-detail">{dimension.detail}</p>
                      <p className="brand-shift__dimension-shift">
                        <strong>Moves from:</strong> {dimension.before}
                        <br />
                        <strong>Moves to:</strong> {dimension.after}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="brand-shift__links">
                <BrandShiftLink href="/foundations/themes" label="Inspect themes" />
                <BrandShiftLink href="/playground" label="Open playground" />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
