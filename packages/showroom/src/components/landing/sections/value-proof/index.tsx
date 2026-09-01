import { type ComponentPropsWithoutRef, useId } from 'react';

const proofSignals = [
  {
    index: '01',
    title: 'Authorship without drift',
    detail:
      'The product reads as intentional, not assembled from exceptions and last-minute overrides.',
  },
  {
    index: '02',
    title: 'Variation with boundaries',
    detail:
      'Brand tone, renderer mood, and surface feel can move without destabilizing the whole stack.',
  },
  {
    index: '03',
    title: 'Shared language at scale',
    detail:
      'Design, engineering, and runtime docs keep pointing at the same contract as the business expands.',
  },
] as const;

const buyingReasons = [
  {
    label: 'Commercial range',
    title: 'Different products can feel distinct without becoming different systems.',
    detail:
      'Teams can launch a quieter enterprise posture, a sharper premium surface, or a more editorial experience while keeping one operating model underneath.',
  },
  {
    label: 'Cleaner handoff',
    title: 'The contract stays readable from design review to runtime.',
    detail:
      'States, spacing logic, composition rules, and accessibility posture remain legible even when the finish changes.',
  },
  {
    label: 'Less override debt',
    title: 'Change happens through defined levers instead of UI improvisation.',
    detail:
      'That is what keeps polish compounding instead of fragmenting as tenants, teams, and launch moments multiply.',
  },
] as const;

const stableLayers = [
  {
    label: 'System spine',
    title: 'Tokens, primitives, states, and structural rules.',
    detail:
      'The fundamentals keep the same grammar so teams do not renegotiate the basics on every release.',
  },
  {
    label: 'Operational clarity',
    title: 'Documentation logic, QA posture, and implementation expectations.',
    detail:
      'The route from concept to shipped screen stays predictable enough to scale across products and contributors.',
  },
  {
    label: 'Behavioral trust',
    title: 'Accessibility, responsiveness, and component semantics.',
    detail:
      'The things users and teams rely on most remain stable while the visual signature evolves around them.',
  },
] as const;

const adaptiveLayers = [
  {
    label: 'Brand posture',
    title: 'Surface finish, visual weight, and editorial temperature.',
    detail:
      'A product can feel quieter, denser, softer, sharper, or more luxurious without leaving the system.',
  },
  {
    label: 'Renderer signature',
    title: 'Chrome density, radius profile, motion mood, and scene pressure.',
    detail:
      'The same component model can express different runtime personalities when the context calls for it.',
  },
  {
    label: 'Product character',
    title: 'How each screen presents confidence, urgency, and hierarchy.',
    detail:
      'This is where differentiation earns its keep: not in random accents, but in the feel of the whole experience.',
  },
] as const;

const bottomLine = [
  'Stable contract',
  'Flexible expression',
  'Premium by default',
  'No override fatigue',
] as const;

export interface ValueProofSectionProps
  extends Omit<ComponentPropsWithoutRef<'section'>, 'children'> {
  includeStyles?: boolean;
}

export const valueProofSectionStyles = `
  .value-proof-section {
    --value-proof-paper: var(--landing-surface, #fbfbf9);
    --value-proof-paper-soft: var(--landing-surface-soft, #f4f4f1);
    --value-proof-paper-strong: var(--landing-paper, #f3f2ef);
    --value-proof-ink: var(--landing-ink, #131110);
    --value-proof-ink-soft: var(--landing-ink-soft, #272626);
    --value-proof-muted: var(--landing-muted, #666561);
    --value-proof-subtle: var(--landing-subtle, #8d8b86);
    --value-proof-line: var(--landing-line, rgba(19, 17, 16, 0.14));
    --value-proof-line-strong: var(--landing-line-strong, rgba(19, 17, 16, 0.24));
    --value-proof-shadow: var(--landing-shadow, 0 22px 56px rgba(19, 17, 16, 0.08));
    position: relative;
    overflow: hidden;
    padding: clamp(28px, 3vw, 42px);
    border-radius: 32px;
    border: 1px solid var(--value-proof-line);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(251, 251, 249, 0.92) 18%, rgba(244, 244, 241, 0.98) 100%),
      linear-gradient(135deg, rgba(19, 17, 16, 0.02) 0%, rgba(19, 17, 16, 0) 42%);
    box-shadow: var(--value-proof-shadow);
    color: var(--value-proof-ink);
    isolation: isolate;
  }

  .value-proof-section::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at top right, rgba(19, 17, 16, 0.08) 0%, rgba(19, 17, 16, 0) 34%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0) 32%);
    pointer-events: none;
  }

  .value-proof-section::after {
    content: "";
    position: absolute;
    inset: 16px;
    border-radius: 24px;
    border: 1px solid rgba(19, 17, 16, 0.06);
    pointer-events: none;
  }

  .value-proof-section,
  .value-proof-section * {
    box-sizing: border-box;
  }

  .value-proof-inner {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 24px;
  }

  .value-proof-header {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(320px, 0.9fr);
    gap: 24px;
    align-items: start;
  }

  .value-proof-kicker,
  .value-proof-panel-label,
  .value-proof-story-label,
  .value-proof-column-label,
  .value-proof-card-label {
    margin: 0;
    color: var(--value-proof-subtle);
    font-family: "Avenir Next", "Helvetica Neue", "Segoe UI", Arial, sans-serif;
    font-size: 0.73rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .value-proof-title {
    margin: 14px 0 0;
    max-width: 12ch;
    color: var(--value-proof-ink-soft);
    font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
    font-size: clamp(2.45rem, 5vw, 4.8rem);
    font-weight: 400;
    line-height: 0.96;
    letter-spacing: -0.05em;
    text-wrap: balance;
  }

  .value-proof-lead {
    margin: 18px 0 0;
    max-width: 60ch;
    color: var(--value-proof-muted);
    font-family: "Avenir Next", "Helvetica Neue", "Segoe UI", Arial, sans-serif;
    font-size: 1.04rem;
    line-height: 1.72;
  }

  .value-proof-panel {
    position: relative;
    display: grid;
    gap: 16px;
    padding: 22px;
    min-height: 100%;
    border-radius: 24px;
    border: 1px solid var(--value-proof-line);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.76) 0%, rgba(243, 242, 239, 0.96) 100%);
  }

  .value-proof-panel::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(135deg, rgba(19, 17, 16, 0.05) 0%, rgba(19, 17, 16, 0) 46%);
    pointer-events: none;
  }

  .value-proof-panel-copy,
  .value-proof-card-copy,
  .value-proof-column-copy,
  .value-proof-signal-copy,
  .value-proof-bottomline-copy {
    margin: 0;
    color: var(--value-proof-muted);
    font-family: "Avenir Next", "Helvetica Neue", "Segoe UI", Arial, sans-serif;
    line-height: 1.65;
  }

  .value-proof-panel-title {
    margin: 0;
    color: var(--value-proof-ink-soft);
    font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
    font-size: clamp(1.45rem, 2.1vw, 2rem);
    font-weight: 400;
    line-height: 1.02;
    letter-spacing: -0.03em;
    text-wrap: balance;
  }

  .value-proof-panel-list {
    display: grid;
    gap: 12px;
  }

  .value-proof-panel-item {
    display: grid;
    gap: 6px;
    padding-top: 12px;
    border-top: 1px solid var(--value-proof-line);
  }

  .value-proof-panel-item:first-child {
    padding-top: 0;
    border-top: 0;
  }

  .value-proof-panel-item strong,
  .value-proof-column-item strong,
  .value-proof-card-title {
    color: var(--value-proof-ink-soft);
  }

  .value-proof-panel-item strong {
    font-family: "Avenir Next", "Helvetica Neue", "Segoe UI", Arial, sans-serif;
    font-size: 0.98rem;
    line-height: 1.35;
  }

  .value-proof-main {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
    gap: 24px;
    align-items: stretch;
  }

  .value-proof-story {
    display: grid;
    gap: 18px;
    padding: clamp(24px, 3vw, 34px);
    border-radius: 28px;
    background:
      radial-gradient(circle at top left, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 24%),
      linear-gradient(180deg, #1b1917 0%, #121110 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 30px 70px rgba(19, 17, 16, 0.18);
    color: #f6f3ee;
  }

  .value-proof-story-label {
    color: rgba(246, 243, 238, 0.58);
  }

  .value-proof-story-title {
    margin: 0;
    max-width: 14ch;
    color: #f8f5f0;
    font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
    font-size: clamp(1.8rem, 3.2vw, 3rem);
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.045em;
    text-wrap: balance;
  }

  .value-proof-story-copy {
    margin: 0;
    max-width: 62ch;
    color: rgba(246, 243, 238, 0.8);
    font-family: "Avenir Next", "Helvetica Neue", "Segoe UI", Arial, sans-serif;
    line-height: 1.72;
  }

  .value-proof-story-rule {
    width: min(100%, 220px);
    height: 1px;
    background: linear-gradient(90deg, rgba(246, 243, 238, 0.55) 0%, rgba(246, 243, 238, 0) 100%);
  }

  .value-proof-signal-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .value-proof-signal {
    display: grid;
    gap: 10px;
    padding: 14px;
    border-radius: 18px;
    border: 1px solid rgba(246, 243, 238, 0.1);
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(10px);
  }

  .value-proof-signal-index {
    color: rgba(246, 243, 238, 0.48);
    font-family: "Avenir Next", "Helvetica Neue", "Segoe UI", Arial, sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .value-proof-signal-title {
    margin: 0;
    color: #f8f5f0;
    font-family: "Avenir Next", "Helvetica Neue", "Segoe UI", Arial, sans-serif;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.35;
  }

  .value-proof-signal-copy {
    color: rgba(246, 243, 238, 0.68);
    font-size: 0.94rem;
  }

  .value-proof-buy-grid {
    display: grid;
    gap: 14px;
  }

  .value-proof-card {
    display: grid;
    gap: 12px;
    padding: 20px;
    border-radius: 22px;
    border: 1px solid var(--value-proof-line);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.86) 0%, rgba(243, 242, 239, 0.94) 100%);
  }

  .value-proof-card-title {
    margin: 0;
    font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
    font-size: 1.4rem;
    font-weight: 400;
    line-height: 1.06;
    letter-spacing: -0.03em;
    text-wrap: balance;
  }

  .value-proof-card-copy {
    font-size: 0.98rem;
  }

  .value-proof-columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }

  .value-proof-column {
    display: grid;
    gap: 18px;
    padding: 24px;
    border-radius: 24px;
    border: 1px solid var(--value-proof-line);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(244, 244, 241, 0.96) 100%);
  }

  .value-proof-column[data-tone="adaptive"] {
    background:
      linear-gradient(180deg, rgba(243, 242, 239, 0.92) 0%, rgba(231, 229, 224, 0.92) 100%);
    border-color: var(--value-proof-line-strong);
  }

  .value-proof-column-head {
    display: grid;
    gap: 10px;
  }

  .value-proof-column-title {
    margin: 0;
    color: var(--value-proof-ink-soft);
    font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
    font-size: clamp(1.6rem, 2.3vw, 2.2rem);
    font-weight: 400;
    line-height: 1.02;
    letter-spacing: -0.035em;
  }

  .value-proof-column-copy {
    max-width: 52ch;
  }

  .value-proof-column-list {
    display: grid;
    gap: 14px;
  }

  .value-proof-column-item {
    display: grid;
    gap: 8px;
    padding-top: 14px;
    border-top: 1px solid var(--value-proof-line);
  }

  .value-proof-column-item:first-child {
    padding-top: 0;
    border-top: 0;
  }

  .value-proof-column-item strong {
    font-family: "Avenir Next", "Helvetica Neue", "Segoe UI", Arial, sans-serif;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.35;
  }

  .value-proof-column-item span {
    color: var(--value-proof-subtle);
    font-family: "Avenir Next", "Helvetica Neue", "Segoe UI", Arial, sans-serif;
    font-size: 0.73rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .value-proof-bottomline {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 16px;
    align-items: center;
    padding-top: 4px;
    border-top: 1px solid var(--value-proof-line);
  }

  .value-proof-bottomline-copy {
    max-width: 56ch;
    color: var(--value-proof-ink-soft);
    font-size: 1rem;
  }

  .value-proof-tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
  }

  .value-proof-tag {
    display: inline-flex;
    align-items: center;
    min-height: 36px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid var(--value-proof-line);
    background: rgba(255, 255, 255, 0.66);
    color: var(--value-proof-ink-soft);
    font-family: "Avenir Next", "Helvetica Neue", "Segoe UI", Arial, sans-serif;
    font-size: 0.86rem;
    font-weight: 600;
    letter-spacing: 0.01em;
    white-space: nowrap;
  }

  @media (max-width: 1120px) {
    .value-proof-header,
    .value-proof-main,
    .value-proof-columns,
    .value-proof-bottomline {
      grid-template-columns: 1fr;
    }

    .value-proof-panel,
    .value-proof-buy-grid {
      min-width: 0;
    }

    .value-proof-tags {
      justify-content: flex-start;
    }
  }

  @media (max-width: 760px) {
    .value-proof-section {
      padding: 22px;
      border-radius: 26px;
    }

    .value-proof-section::after {
      inset: 10px;
      border-radius: 18px;
    }

    .value-proof-panel,
    .value-proof-column,
    .value-proof-card,
    .value-proof-story {
      padding: 18px;
      border-radius: 20px;
    }

    .value-proof-title {
      max-width: none;
    }

    .value-proof-story-title,
    .value-proof-column-title,
    .value-proof-panel-title,
    .value-proof-card-title {
      text-wrap: pretty;
    }

    .value-proof-signal-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export function ValueProofSection({
  className,
  id,
  includeStyles = true,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: ValueProofSectionProps) {
  const sectionTitleId = `${id ?? 'value-proof'}-${useId()}-title`;
  const sectionClassName = ['value-proof-section', className].filter(Boolean).join(' ');

  return (
    <>
      <section
        {...props}
        id={id}
        className={sectionClassName}
        aria-labelledby={ariaLabelledBy ?? sectionTitleId}
      >
        <div className="value-proof-inner">
          <header className="value-proof-header">
            <div>
              <p className="value-proof-kicker">Value proof</p>
              <h2 className="value-proof-title" id={sectionTitleId}>
                Teams buy the stable spine. The product gets room to perform.
              </h2>
              <p className="value-proof-lead">
                The real sale is not just prettier UI. It is a system that keeps the operating
                logic steady while brand posture, renderer mood, and product character can move with
                intent.
              </p>
            </div>

            <aside className="value-proof-panel">
              <p className="value-proof-panel-label">Operating promise</p>
              <p className="value-proof-panel-title">Fixed rules underneath. Visible range above.</p>
              <p className="value-proof-panel-copy">
                That is what makes the landing credible: the parts that teams rely on stay stable,
                and the parts that signal differentiation stay flexible enough to matter.
              </p>

              <div className="value-proof-panel-list">
                <div className="value-proof-panel-item">
                  <strong>One contract for product, brand, and engineering.</strong>
                  <p className="value-proof-panel-copy">
                    Teams keep one vocabulary even when the feel of the product changes.
                  </p>
                </div>
                <div className="value-proof-panel-item">
                  <strong>Premium by default, not by endless clean-up.</strong>
                  <p className="value-proof-panel-copy">
                    The system carries polish structurally instead of asking every screen to invent
                    it again.
                  </p>
                </div>
                <div className="value-proof-panel-item">
                  <strong>Enough range to launch without forking the design language.</strong>
                  <p className="value-proof-panel-copy">
                    Variation becomes a feature of the system instead of a tax on the team.
                  </p>
                </div>
              </div>
            </aside>
          </header>

          <div className="value-proof-main">
            <article className="value-proof-story">
              <p className="value-proof-story-label">Why teams say yes</p>
              <h3 className="value-proof-story-title">
                They are not buying a kit. They are buying the ability to evolve the feel without
                losing the plot.
              </h3>
              <p className="value-proof-story-copy">
                When the system is healthy, teams stop debating edge treatment, spacing logic, or
                state language on every launch. Those decisions have a dependable home.
              </p>
              <p className="value-proof-story-copy">
                That frees the product to express the things that should actually move: how premium
                it feels, how much chrome it carries, how a surface signals confidence, and how a
                branded experience stays unmistakably authored from screen to screen.
              </p>
              <div className="value-proof-story-rule" aria-hidden="true" />

              <div className="value-proof-signal-grid">
                {proofSignals.map((signal) => (
                  <div className="value-proof-signal" key={signal.index}>
                    <span className="value-proof-signal-index">{signal.index}</span>
                    <p className="value-proof-signal-title">{signal.title}</p>
                    <p className="value-proof-signal-copy">{signal.detail}</p>
                  </div>
                ))}
              </div>
            </article>

            <div className="value-proof-buy-grid">
              {buyingReasons.map((reason) => (
                <article className="value-proof-card" key={reason.label}>
                  <p className="value-proof-card-label">{reason.label}</p>
                  <h3 className="value-proof-card-title">{reason.title}</h3>
                  <p className="value-proof-card-copy">{reason.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="value-proof-columns">
            <article className="value-proof-column" data-tone="stable">
              <header className="value-proof-column-head">
                <p className="value-proof-column-label">What stays stable</p>
                <h3 className="value-proof-column-title">The spine should stay calm.</h3>
                <p className="value-proof-column-copy">
                  Stability is what makes the system operationally valuable. These are the layers
                  that should not drift every time the business wants a new expression.
                </p>
              </header>

              <div className="value-proof-column-list">
                {stableLayers.map((item) => (
                  <div className="value-proof-column-item" key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.title}</strong>
                    <p className="value-proof-column-copy">{item.detail}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="value-proof-column" data-tone="adaptive">
              <header className="value-proof-column-head">
                <p className="value-proof-column-label">What can change</p>
                <h3 className="value-proof-column-title">The signature should stay alive.</h3>
                <p className="value-proof-column-copy">
                  This is where the system earns its commercial edge. Variation should feel chosen,
                  not accidental, and distinctive without becoming structurally expensive.
                </p>
              </header>

              <div className="value-proof-column-list">
                {adaptiveLayers.map((item) => (
                  <div className="value-proof-column-item" key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.title}</strong>
                    <p className="value-proof-column-copy">{item.detail}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <footer className="value-proof-bottomline">
            <p className="value-proof-bottomline-copy">
              Premium software rarely comes from constant reinvention. It comes from choosing the
              right things to keep still, then giving the visible layers enough room to feel
              unmistakably yours.
            </p>

            <div className="value-proof-tags" aria-label="Section highlights">
              {bottomLine.map((item) => (
                <span className="value-proof-tag" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </footer>
        </div>
      </section>

      {includeStyles ? <style>{valueProofSectionStyles}</style> : null}
    </>
  );
}

export default ValueProofSection;
