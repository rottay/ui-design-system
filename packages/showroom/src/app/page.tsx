import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { ShowroomLink as Link } from '@/components/showroom-link';
import { charts } from '@/data/registry/charts';
import { icons } from '@/data/registry/icons';
import { patterns } from '@/data/registry/patterns';
import { primitives } from '@/data/registry/primitives';
import { structures } from '@/data/registry/structures';
import { surfaces } from '@/data/registry/surfaces';
import { EngineSignaturesSection } from '@/components/landing/engine-signatures-section';
import { MarketingHero } from '@/components/landing/marketing-hero';
import ValueProofSection from '@/components/landing/value-proof-section';
import { BrandShiftSection } from '@/components/landing/brand-shift-section';
import { ArrowUpRight } from 'lucide-react';
import { ArrowRightIcon } from '@rottay/design-system/icons';

export const metadata: Metadata = {
  title: 'Rottay Design System',
  description:
    'Rottay Design System is a commercial UI system with multi-engine rendering, systemic white-labeling, and a showroom built to prove product-grade depth.',
};

const catalogTotal =
  primitives.length +
  patterns.length +
  structures.length +
  surfaces.length +
  charts.length +
  icons.length;

const landingTheme: CSSProperties = {
  ['--landing-paper' as string]: '#f3f2ef',
  ['--landing-paper-strong' as string]: '#e7e5e0',
  ['--landing-surface' as string]: '#fbfbf9',
  ['--landing-surface-soft' as string]: '#f4f4f1',
  ['--landing-ink' as string]: '#131110',
  ['--landing-ink-soft' as string]: '#272626',
  ['--landing-muted' as string]: '#666561',
  ['--landing-subtle' as string]: '#8d8b86',
  ['--landing-line' as string]: 'rgba(19, 17, 16, 0.14)',
  ['--landing-line-strong' as string]: 'rgba(19, 17, 16, 0.24)',
  ['--landing-shadow' as string]: '0 22px 56px rgba(19, 17, 16, 0.08)',
};

const depthCards = [
  {
    label: 'Primitives',
    count: primitives.length,
    detail: 'The reusable core: inputs, feedback, layout, navigation, overlay, display.',
    href: '/primitives',
  },
  {
    label: 'Patterns',
    count: patterns.length,
    detail: 'Workflow modules assembled for product behavior, not just visual fragments.',
    href: '/patterns',
  },
  {
    label: 'Structures',
    count: structures.length,
    detail: 'Headers, shells, and layout frames that give screens a stable editorial spine.',
    href: '/structures',
  },
  {
    label: 'Surfaces',
    count: surfaces.length,
    detail: 'Full-page recipes where the system stops talking and starts shipping.',
    href: '/surfaces',
  },
] as const;

const routeStops = [
  {
    index: '01',
    title: 'Foundations',
    href: '/foundations',
    detail: 'Start with the underlying visual logic: tokens, themes, engines, and vocabulary.',
  },
  {
    index: '02',
    title: 'Playground',
    href: '/playground',
    detail: 'See renderer and tenant context move on a real provider chain.',
  },
  {
    index: '03',
    title: 'Architecture',
    href: '/developers/architecture',
    detail: 'Understand what belongs inside the system and what should stay in product space.',
  },
  {
    index: '04',
    title: 'Catalog',
    href: '/primitives',
    detail: 'Walk from primitives to full surfaces without losing the runtime narrative.',
  },
] as const;

function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link className="landing-nav-link" href={href}>
      <span>{label}</span>
      <ArrowUpRight size={14} strokeWidth={1.8} />
    </Link>
  );
}

function PrimaryLink({
  href,
  label,
  tone = 'default',
}: {
  href: string;
  label: string;
  tone?: 'default' | 'dark';
}) {
  return (
    <Link className={`landing-cta ${tone === 'dark' ? 'landing-cta-dark' : ''}`.trim()} href={href}>
      <span>{label}</span>
      <ArrowRightIcon size={14} />
    </Link>
  );
}

function InlineLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link className="landing-inline-link" href={href}>
      <span>{label}</span>
      <ArrowUpRight size={14} strokeWidth={1.8} />
    </Link>
  );
}

export default function LandingPage() {
  return (
    <main className="landing-root" style={landingTheme}>
      <div className="landing-shell">
        <header className="landing-masthead landing-animate landing-delay-1">
          <div className="landing-masthead-left">
            <div className="landing-mark">R</div>
            <div className="landing-masthead-copy">
              <p className="landing-brand-title">Rottay Design System</p>
              <p className="landing-brand-subtitle">
                Built to make branded software feel authored at scale.
              </p>
            </div>
          </div>

          <div className="landing-masthead-meta">
            <span>Published package</span>
            <span>Issue 01</span>
            <span>Neutral front door</span>
          </div>

          <nav className="landing-nav" aria-label="Primary">
            <NavLink href="/foundations" label="Foundations" />
            <NavLink href="/developers/architecture" label="Architecture" />
            <NavLink href="/playground" label="Playground" />
            <NavLink href="/primitives" label="Catalog" />
          </nav>
        </header>

        <MarketingHero
          catalogTotal={catalogTotal}
          className="landing-animate landing-delay-2"
          primaryAction={{ href: '/foundations', label: 'Enter foundations' }}
          secondaryAction={{ href: '/playground', label: 'See the playground' }}
        />

        <section className="landing-thesis landing-animate landing-delay-3">
          <p className="landing-section-label landing-section-label-dark">System thesis</p>
          <h2 className="landing-thesis-title">
            Variation should still feel deliberate.
          </h2>
          <p className="landing-thesis-copy">
            Renderer tone, brand voice, and screen-level depth can move inside one system instead
            of splintering into overrides and visual drift.
          </p>
          <div className="landing-thesis-rule" aria-hidden="true" />
        </section>

        <ValueProofSection className="landing-animate landing-delay-4" />

        <EngineSignaturesSection
          className="landing-animate landing-delay-5"
          description="A controlled comparison where hierarchy, intent, and actions remain fixed so the renderer differences read like authored product posture instead of cosmetic noise."
        />

        <BrandShiftSection className="landing-animate landing-delay-6" />

        <section className="landing-depth landing-animate landing-delay-7">
          <div className="landing-section-head">
            <div>
              <p className="landing-section-label">System depth</p>
              <h2 className="landing-section-title">A deep package behind the promise.</h2>
            </div>
            <p className="landing-section-copy">
              The front door only works because the package underneath is real. This is not a brand
              page floating over a shallow component list.
            </p>
          </div>

          <div className="landing-depth-layout">
            <article className="landing-depth-hero">
              <p className="landing-depth-hero-label">Coverage</p>
              <div className="landing-depth-hero-count">{catalogTotal}</div>
              <p className="landing-depth-hero-copy">
                documented assets across primitives, patterns, structures, surfaces, charts, and
                icons.
              </p>
              <InlineLink href="/primitives" label="Browse the catalog" />
            </article>

            {depthCards.map((card) => (
              <article className="landing-depth-card" key={card.label}>
                <div className="landing-depth-card-head">
                  <span>{card.label}</span>
                  <strong>{card.count}</strong>
                </div>
                <p className="landing-depth-card-copy">{card.detail}</p>
                <InlineLink href={card.href} label={`Open ${card.label.toLowerCase()}`} />
              </article>
            ))}
          </div>
        </section>

        <section className="landing-routes landing-animate landing-delay-8">
          <div className="landing-section-head landing-section-head-tight">
            <div>
              <p className="landing-section-label">Walk the showroom</p>
              <h2 className="landing-section-title">The landing sells it. The routes prove it.</h2>
            </div>
            <p className="landing-section-copy">
              The handoff should be immediate and obvious: first understand the model, then watch it
              move, then inspect the full catalog at package depth.
            </p>
          </div>

          <div className="landing-route-list">
            {routeStops.map((stop) => (
              <article className="landing-route-row" key={stop.title}>
                <div className="landing-route-index">{stop.index}</div>
                <div className="landing-route-copy">
                  <p className="landing-route-title">{stop.title}</p>
                  <p className="landing-route-detail">{stop.detail}</p>
                </div>
                <InlineLink href={stop.href} label="Enter" />
              </article>
            ))}
          </div>
        </section>

        <section className="landing-close landing-animate landing-delay-9">
          <p className="landing-section-label landing-section-label-dark">Closing statement</p>
          <h2 className="landing-close-title">
            If the product needs range, polish, and structural discipline at the same time, this is
            the right front door.
          </h2>
          <p className="landing-close-copy">
            Start with the model. Then watch the runtime carry it.
          </p>
          <div className="landing-close-actions">
            <PrimaryLink href="/foundations" label="Start with foundations" tone="dark" />
            <PrimaryLink href="/playground" label="Open playground" />
          </div>
        </section>
      </div>

      <style>{`
        .landing-root {
          min-height: 100vh;
          background:
            linear-gradient(180deg, var(--landing-paper) 0%, #f0efeb 100%),
            repeating-linear-gradient(90deg, transparent 0, transparent 111px, rgba(19, 17, 16, 0.03) 112px),
            repeating-linear-gradient(180deg, transparent 0, transparent 111px, rgba(19, 17, 16, 0.03) 112px);
          color: var(--landing-ink);
          font-family: "Avenir Next", "Helvetica Neue", "Segoe UI", Arial, sans-serif;
        }

        .landing-root * {
          box-sizing: border-box;
        }

        .landing-shell {
          width: min(1720px, calc(100vw - 32px));
          margin: 0 auto;
          padding: 28px 0 72px;
        }

        .landing-masthead,
        .landing-cover,
        .landing-engine-stage,
        .landing-branding,
        .landing-depth,
        .landing-routes {
          background: linear-gradient(180deg, rgba(251, 251, 249, 0.95) 0%, rgba(244, 244, 241, 0.92) 100%);
          border: 1px solid var(--landing-line);
          box-shadow: var(--landing-shadow);
        }

        .landing-masthead {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 22px;
          padding: 18px 22px;
          border-radius: 22px;
          margin-bottom: 18px;
        }

        .landing-masthead-left {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .landing-mark {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: var(--landing-ink);
          color: var(--landing-surface);
          font-size: 0.98rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .landing-brand-title,
        .landing-brand-subtitle,
        .landing-kicker,
        .landing-cover-side-copy,
        .landing-cover-description,
        .landing-cover-manifesto-title,
        .landing-cover-manifesto-detail,
        .landing-proof-label,
        .landing-proof-body,
        .landing-thesis-title,
        .landing-thesis-copy,
        .landing-section-copy,
        .landing-engine-posture,
        .landing-engine-note,
        .landing-depth-hero-label,
        .landing-depth-hero-copy,
        .landing-depth-card-copy,
        .landing-route-title,
        .landing-route-detail,
        .landing-close-copy {
          margin: 0;
        }

        .landing-brand-title {
          font-size: 0.84rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .landing-brand-subtitle {
          margin-top: 6px;
          color: var(--landing-muted);
          font-size: 1rem;
          line-height: 1.45;
        }

        .landing-masthead-meta {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px 16px;
          padding: 0 18px;
          color: var(--landing-subtle);
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .landing-nav {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 16px;
          justify-content: end;
        }

        .landing-nav-link,
        .landing-inline-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--landing-ink-soft);
          text-decoration: none;
          font-size: 0.92rem;
          font-weight: 600;
        }

        .landing-nav-link:hover,
        .landing-inline-link:hover {
          text-decoration: underline;
          text-underline-offset: 0.18em;
        }

        .landing-cover {
          border-radius: 28px;
          overflow: hidden;
          margin-bottom: 18px;
        }

        .landing-cover-topline,
        .landing-cover-bottomline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px 18px;
          flex-wrap: wrap;
          padding: 14px 22px;
          color: var(--landing-subtle);
          font-size: 0.76rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .landing-cover-topline {
          border-bottom: 1px solid var(--landing-line);
        }

        .landing-cover-bottomline {
          border-top: 1px solid var(--landing-line);
        }

        .landing-cover-grid {
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr) 340px;
          gap: 0;
        }

        .landing-cover-side,
        .landing-cover-main,
        .landing-cover-proof {
          padding: 28px;
          min-width: 0;
        }

        .landing-cover-side,
        .landing-cover-main {
          border-right: 1px solid var(--landing-line);
        }

        .landing-kicker,
        .landing-section-label {
          color: var(--landing-subtle);
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .landing-cover-side-copy {
          margin-top: 18px;
          color: var(--landing-muted);
          font-size: 1.02rem;
          line-height: 1.72;
        }

        .landing-cover-actions,
        .landing-close-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 24px;
        }

        .landing-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-height: 48px;
          padding: 0 18px;
          border-radius: 999px;
          border: 1px solid var(--landing-line-strong);
          background: rgba(255, 255, 255, 0.58);
          color: var(--landing-ink-soft);
          text-decoration: none;
          font-size: 0.94rem;
          font-weight: 600;
          transition: transform 180ms ease, background 180ms ease;
        }

        .landing-cta:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.82);
        }

        .landing-cta-dark {
          background: var(--landing-ink);
          color: var(--landing-surface);
          border-color: rgba(19, 17, 16, 0.8);
        }

        .landing-cover-main {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .landing-cover-title,
        .landing-thesis-title,
        .landing-section-title,
        .landing-close-title {
          font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
        }

        .landing-cover-title {
          margin: 0;
          color: var(--landing-ink-soft);
          font-size: clamp(4rem, 7vw, 7.4rem);
          line-height: 0.93;
          letter-spacing: -0.07em;
          max-width: 10ch;
        }

        .landing-cover-description {
          margin-top: 20px;
          max-width: 34ch;
          color: var(--landing-muted);
          font-size: 1.2rem;
          line-height: 1.7;
        }

        .landing-cover-manifesto {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid var(--landing-line);
        }

        .landing-cover-manifesto-item {
          min-width: 0;
          padding-right: 10px;
        }

        .landing-cover-manifesto-title {
          color: var(--landing-ink-soft);
          font-size: 0.92rem;
          font-weight: 700;
          line-height: 1.35;
          letter-spacing: -0.02em;
        }

        .landing-cover-manifesto-detail {
          margin-top: 8px;
          color: var(--landing-muted);
          font-size: 0.88rem;
          line-height: 1.58;
        }

        .landing-cover-proof {
          display: grid;
          gap: 16px;
        }

        .landing-proof-row {
          padding-top: 16px;
          border-top: 1px solid var(--landing-line);
        }

        .landing-proof-row:first-child {
          padding-top: 0;
          border-top: none;
        }

        .landing-proof-label {
          color: var(--landing-subtle);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .landing-proof-title {
          margin: 10px 0 0;
          color: var(--landing-ink-soft);
          font-size: 1.28rem;
          line-height: 1.2;
          letter-spacing: -0.03em;
        }

        .landing-proof-body {
          margin-top: 10px;
          color: var(--landing-muted);
          font-size: 1rem;
          line-height: 1.68;
        }

        .landing-cover-quote {
          color: var(--landing-ink-soft);
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: -0.01em;
        }

        .landing-cover-stats {
          display: flex;
          flex-wrap: wrap;
          justify-content: end;
          gap: 12px 18px;
        }

        .landing-thesis,
        .landing-close {
          background: linear-gradient(180deg, rgba(19, 19, 19, 0.98) 0%, rgba(34, 34, 34, 0.94) 100%);
          border: 1px solid rgba(251, 251, 249, 0.08);
          box-shadow: var(--landing-shadow);
          color: var(--landing-surface);
        }

        .landing-thesis {
          padding: 34px 32px;
          border-radius: 24px;
          margin-bottom: 18px;
          overflow: hidden;
        }

        .landing-section-label-dark {
          color: rgba(251, 251, 249, 0.64);
        }

        .landing-thesis-title {
          margin-top: 18px;
          max-width: 18ch;
          color: rgba(251, 251, 249, 0.96);
          font-size: clamp(2.4rem, 4.2vw, 4.6rem);
          line-height: 0.98;
          letter-spacing: -0.06em;
        }

        .landing-thesis-copy {
          margin-top: 18px;
          max-width: 62ch;
          color: rgba(251, 251, 249, 0.68);
          font-size: 1.08rem;
          line-height: 1.75;
        }

        .landing-thesis-rule {
          margin-top: 26px;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(251, 251, 249, 0.64), transparent);
          transform-origin: left center;
          animation: landingSweep 8s ease-in-out infinite;
        }

        .landing-engine-stage,
        .landing-branding,
        .landing-depth,
        .landing-routes {
          padding: 28px;
          border-radius: 24px;
          margin-bottom: 18px;
        }

        .landing-section-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(280px, 480px);
          gap: 22px;
          align-items: end;
          padding-bottom: 18px;
          border-bottom: 1px solid var(--landing-line);
        }

        .landing-section-head-tight {
          align-items: start;
        }

        .landing-section-title {
          margin: 12px 0 0;
          color: var(--landing-ink-soft);
          font-size: clamp(2.2rem, 4vw, 3.5rem);
          line-height: 0.98;
          letter-spacing: -0.05em;
        }

        .landing-section-copy {
          color: var(--landing-muted);
          font-size: 1.04rem;
          line-height: 1.72;
        }

        .landing-engine-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-top: 24px;
        }

        .landing-engine-card {
          display: flex;
          flex-direction: column;
          min-width: 0;
          border: 1px solid var(--landing-line);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.74) 0%, rgba(243, 243, 240, 0.92) 100%);
          border-radius: 20px;
          padding: 16px;
          min-height: 100%;
        }

        .landing-engine-card[data-engine="classic"] .landing-engine-surface,
        .landing-engine-card[data-engine="classic"] .landing-engine-fingerprint-item {
          border-radius: 14px;
        }

        .landing-engine-card[data-engine="modern"] .landing-engine-surface,
        .landing-engine-card[data-engine="modern"] .landing-engine-fingerprint-item {
          border-radius: 24px;
        }

        .landing-engine-card[data-engine="rustic"] .landing-engine-surface,
        .landing-engine-card[data-engine="rustic"] .landing-engine-fingerprint-item {
          border-radius: 18px;
        }

        .landing-engine-head {
          display: flex;
          align-items: start;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--landing-line);
        }

        .landing-engine-name {
          margin: 0;
          color: var(--landing-ink-soft);
          font-size: 1.4rem;
          letter-spacing: -0.03em;
        }

        .landing-engine-posture {
          margin-top: 6px;
          color: var(--landing-muted);
          font-size: 0.98rem;
          line-height: 1.55;
        }

        .landing-engine-tag {
          color: var(--landing-subtle);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .landing-engine-preview {
          display: flex;
          flex-direction: column;
          flex: 1 1 auto;
          min-height: 0;
          margin-top: 16px;
          padding: 12px;
          border: 1px solid var(--landing-line);
          border-radius: 18px;
          background: rgba(19, 17, 16, 0.04);
        }

        .landing-engine-preview-bar {
          display: flex;
          gap: 6px;
        }

        .landing-engine-preview-bar span {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: rgba(19, 17, 16, 0.42);
        }

        .landing-engine-surface {
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex: 1 1 auto;
          min-height: 0;
          margin-top: 12px;
          padding: 16px;
          border: 1px solid var(--landing-line);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.82) 0%, rgba(240, 231, 219, 0.86) 100%);
        }

        .landing-engine-surface-top {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          color: var(--landing-subtle);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .landing-engine-items {
          display: grid;
          gap: 10px;
        }

        .landing-engine-item {
          display: flex;
          align-items: center;
          min-height: 42px;
          padding: 0 14px;
          border: 1px solid var(--landing-line-strong);
          border-radius: 999px;
          color: var(--landing-ink-soft);
          background: rgba(255, 255, 255, 0.8);
          font-size: 0.92rem;
        }

        .landing-engine-fingerprint {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .landing-engine-fingerprint-item {
          padding: 12px;
          border: 1px solid var(--landing-line);
          background: rgba(255, 255, 255, 0.76);
        }

        .landing-engine-fingerprint-item span {
          display: block;
          color: var(--landing-subtle);
          font-size: 0.64rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .landing-engine-fingerprint-item strong {
          display: block;
          margin-top: 8px;
          color: var(--landing-ink-soft);
          font-size: 0.94rem;
          line-height: 1.3;
          letter-spacing: -0.02em;
        }

        .landing-engine-note {
          margin-top: 14px;
          color: var(--landing-muted);
          font-size: 0.98rem;
          line-height: 1.62;
        }

        .landing-branding-grid {
          display: grid;
          grid-template-columns: 340px minmax(0, 1fr);
          gap: 20px;
          margin-top: 24px;
        }

        .landing-branding-copy {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 18px;
          padding-right: 12px;
          color: var(--landing-muted);
          font-size: 1.04rem;
          line-height: 1.74;
        }

        .landing-branding-callout {
          display: grid;
          gap: 6px;
          padding: 18px 0 0;
          border-top: 1px solid var(--landing-line);
        }

        .landing-branding-callout strong {
          color: var(--landing-ink-soft);
          font-size: 1.08rem;
          letter-spacing: -0.02em;
        }

        .landing-branding-callout span {
          color: var(--landing-muted);
          font-size: 0.96rem;
          line-height: 1.6;
        }

        .landing-runtime-chain {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .landing-runtime-node {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 12px;
          min-height: 122px;
          padding: 16px;
          border: 1px solid var(--landing-line);
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.78) 0%, rgba(243, 243, 240, 0.9) 100%);
        }

        .landing-runtime-node::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(19, 17, 16, 0.28), transparent);
        }

        .landing-runtime-node-index {
          color: var(--landing-subtle);
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .landing-runtime-node-label {
          color: var(--landing-ink-soft);
          font-size: 1.06rem;
          line-height: 1.28;
          letter-spacing: -0.02em;
        }

        .landing-runtime-node-detail {
          color: var(--landing-muted);
          font-size: 0.84rem;
          line-height: 1.5;
        }

        .landing-depth-layout {
          display: grid;
          grid-template-columns: 1.15fr repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 24px;
        }

        .landing-depth-hero {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          grid-row: span 2;
          min-height: 100%;
          padding: 24px;
          border: 1px solid var(--landing-line);
          border-radius: 20px;
          background: linear-gradient(180deg, rgba(19, 19, 19, 0.98) 0%, rgba(41, 41, 41, 0.96) 100%);
          color: var(--landing-surface);
        }

        .landing-depth-hero-label {
          color: rgba(251, 251, 249, 0.58);
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .landing-depth-hero-count {
          margin-top: 22px;
          font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
          font-size: clamp(5rem, 9vw, 8rem);
          line-height: 0.88;
          letter-spacing: -0.08em;
        }

        .landing-depth-hero-copy {
          margin-top: 16px;
          max-width: 24ch;
          color: rgba(251, 251, 249, 0.72);
          font-size: 1.08rem;
          line-height: 1.68;
        }

        .landing-depth-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 0;
          padding: 18px;
          border: 1px solid var(--landing-line);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.72);
        }

        .landing-depth-card-head {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 12px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--landing-line);
        }

        .landing-depth-card-head span {
          color: var(--landing-subtle);
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .landing-depth-card-head strong {
          color: var(--landing-ink-soft);
          font-size: 2.2rem;
          line-height: 0.92;
          letter-spacing: -0.06em;
        }

        .landing-depth-card-copy {
          flex: 1 1 auto;
          color: var(--landing-muted);
          font-size: 0.98rem;
          line-height: 1.66;
        }

        .landing-route-list {
          display: grid;
          gap: 0;
          margin-top: 24px;
        }

        .landing-route-row {
          display: grid;
          grid-template-columns: 88px minmax(0, 1fr) auto;
          gap: 18px;
          align-items: center;
          padding: 18px 0;
          border-top: 1px solid var(--landing-line);
        }

        .landing-route-row:first-child {
          border-top: none;
          padding-top: 0;
        }

        .landing-route-index {
          color: var(--landing-subtle);
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .landing-route-title {
          color: var(--landing-ink-soft);
          font-size: 1.18rem;
          line-height: 1.18;
          letter-spacing: -0.03em;
        }

        .landing-route-detail {
          margin-top: 8px;
          color: var(--landing-muted);
          font-size: 0.98rem;
          line-height: 1.66;
        }

        .landing-close {
          padding: 32px;
          border-radius: 24px;
        }

        .landing-close-title {
          margin: 18px 0 0;
          max-width: 16ch;
          color: rgba(251, 251, 249, 0.96);
          font-size: clamp(2.6rem, 4.4vw, 4.8rem);
          line-height: 0.96;
          letter-spacing: -0.06em;
        }

        .landing-close-copy {
          margin-top: 16px;
          color: rgba(251, 251, 249, 0.68);
          font-size: 1.08rem;
          line-height: 1.72;
        }

        .landing-animate {
          opacity: 1;
          transform: none;
          animation: landingFadeUp 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: transform, opacity;
        }

        .landing-delay-1 { animation-delay: 80ms; }
        .landing-delay-2 { animation-delay: 140ms; }
        .landing-delay-3 { animation-delay: 200ms; }
        .landing-delay-4 { animation-delay: 260ms; }
        .landing-delay-5 { animation-delay: 320ms; }
        .landing-delay-6 { animation-delay: 380ms; }
        .landing-delay-7 { animation-delay: 440ms; }
        .landing-delay-8 { animation-delay: 500ms; }

        @keyframes landingFadeUp {
          from {
            opacity: 0.72;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes landingSweep {
          0%, 100% {
            transform: scaleX(0.22);
            opacity: 0.4;
          }
          50% {
            transform: scaleX(1);
            opacity: 1;
          }
        }

        @media (max-width: 1240px) {
          .landing-shell {
            width: min(1720px, calc(100vw - 24px));
          }

          .landing-cover-grid {
            grid-template-columns: 220px minmax(0, 1fr) 300px;
          }

          .landing-branding-grid,
          .landing-runtime-chain {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .landing-depth-layout {
            grid-template-columns: 1fr 1fr;
          }

          .landing-depth-hero {
            grid-column: 1 / -1;
            grid-row: auto;
          }
        }

        @media (max-width: 1024px) {
          .landing-masthead,
          .landing-section-head,
          .landing-branding-grid,
          .landing-route-row {
            grid-template-columns: 1fr;
          }

          .landing-cover-grid {
            grid-template-columns: 1fr;
          }

          .landing-cover-side,
          .landing-cover-main {
            border-right: none;
            border-bottom: 1px solid var(--landing-line);
          }

          .landing-engine-grid,
          .landing-runtime-chain,
          .landing-depth-layout {
            grid-template-columns: 1fr;
          }

          .landing-cover-manifesto {
            grid-template-columns: 1fr;
          }

          .landing-engine-fingerprint {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .landing-shell {
            width: min(1720px, calc(100vw - 16px));
            padding: 18px 0 48px;
          }

          .landing-masthead,
          .landing-engine-stage,
          .landing-branding,
          .landing-depth,
          .landing-routes,
          .landing-thesis,
          .landing-close {
            padding: 18px;
          }

          .landing-cover-side,
          .landing-cover-main,
          .landing-cover-proof {
            padding: 18px;
          }

          .landing-cover-topline,
          .landing-cover-bottomline {
            padding: 12px 18px;
          }

          .landing-nav {
            justify-content: start;
          }

          .landing-cover-title,
          .landing-close-title {
            max-width: none;
          }

          .landing-cover-description {
            max-width: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .landing-animate,
          .landing-thesis-rule {
            animation: none !important;
            transform: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </main>
  );
}
