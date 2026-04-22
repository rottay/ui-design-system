type MarketingHeroLink = {
  href: string;
  label: string;
};

export type MarketingHeroProps = {
  catalogTotal?: number;
  className?: string;
  includeStyles?: boolean;
  primaryAction?: MarketingHeroLink;
  secondaryAction?: MarketingHeroLink;
};

const tickerItems = [
  "Editorial front door",
  "Brand-first showroom",
  "Premium calm, not noise",
  "Proof before deep dive",
] as const;

const introSignals = [
  "Leadership reviews",
  "Partner demos",
  "Brand alignment",
] as const;

const headlineNotes = [
  "Leadership-ready",
  "Brand-forward",
  "Calm by design",
] as const;

const manifestoItems = [
  {
    title: "Authorship over garnish",
    detail:
      "A stronger silhouette and cleaner pacing let the landing feel considered before a single route is opened.",
  },
  {
    title: "Premium without theatre",
    detail:
      "Contrast, proportion, and rhythm do the work, so the page feels expensive without leaning on louder color.",
  },
  {
    title: "A cover that keeps selling",
    detail:
      "The landing creates desire first, then hands the story to docs, routes, and live surfaces without losing shape.",
  },
] as const;

const stageHighlights = [
  {
    label: "Opening read",
    value: "Looks intentional in under ten seconds",
    detail: "The hierarchy lands faster, so the first impression feels composed instead of merely tidy.",
  },
  {
    label: "Decision room",
    value: "Brand and product share one picture",
    detail: "The cover gives stakeholders a common read on quality before implementation detail takes over.",
  },
  {
    label: "After the first click",
    value: "The promise carries into real routes",
    detail: "The page sets a standard the rest of the showroom can actually support.",
  },
] as const;

const proofCards = [
  {
    label: "What changes first",
    title: "The system stops reading like scaffolding.",
    body:
      "The landing behaves more like a product story than a neutral index, which raises confidence before the catalog opens.",
    emphasis: true,
  },
  {
    label: "What buyers feel",
    title: "More confidence in the room",
    body:
      "A stronger first surface helps leadership, partners, and clients understand the system as an asset, not just an internal tool.",
    emphasis: false,
  },
  {
    label: "What stays disciplined",
    title: "Neutral palette, stronger signature",
    body:
      "The page stays white, gray, and black while composition, contrast, and copy carry the distinction.",
    emphasis: false,
  },
] as const;

const statementTags = [
  "Product posture",
  "Brand clarity",
  "Commercial polish",
] as const;

const defaultPrimaryAction = {
  href: "/foundations",
  label: "Enter foundations",
} satisfies MarketingHeroLink;

const defaultSecondaryAction = {
  href: "/playground",
  label: "See the playground",
} satisfies MarketingHeroLink;

function formatCatalogSummary(catalogTotal?: number) {
  if (typeof catalogTotal === "number" && Number.isFinite(catalogTotal) && catalogTotal > 0) {
    return `${catalogTotal}+ documented assets`;
  }

  return "Docs, assets, and live surface coverage";
}

function joinClassNames(...tokens: Array<string | undefined>) {
  return tokens.filter(Boolean).join(" ");
}

export function MarketingHero({
  catalogTotal,
  className,
  includeStyles = true,
  primaryAction = defaultPrimaryAction,
  secondaryAction = defaultSecondaryAction,
}: MarketingHeroProps) {
  const proofStrip = [
    {
      label: "Signature range",
      value: "Three moods, one authored proposition",
      detail: "Different products can feel distinct without looking assembled from unrelated parts.",
    },
    {
      label: "Coverage",
      value: formatCatalogSummary(catalogTotal),
      detail: "The promise carries from the cover into the routes that prove it.",
    },
    {
      label: "Commercial posture",
      value: "Product story before component story",
      detail: "The landing sells the system first and leaves the catalog to do the proving.",
    },
    {
      label: "Operating signal",
      value: "A better page for scrutiny and buy-in",
      detail: "Useful for decisions where product quality, brand confidence, and system depth all matter.",
    },
  ] as const;

  return (
    <section className={joinClassNames("marketing-hero", className)}>
      {includeStyles ? <style>{marketingHeroStyles}</style> : null}

      <div className="marketing-hero__ticker" aria-label="Hero manifesto">
        {tickerItems.map((item) => (
          <span className="marketing-hero__ticker-item" key={item}>
            {item}
          </span>
        ))}
      </div>

      <div className="marketing-hero__frame">
        <div className="marketing-hero__grid">
          <div className="marketing-hero__main">
            <div className="marketing-hero__lead">
              <div className="marketing-hero__lead-meta">
                <p className="marketing-hero__kicker">Market-facing hero</p>
                <div className="marketing-hero__edition" aria-label="Hero edition">
                  <span>Issue 01</span>
                  <span>Neutral cut</span>
                </div>
              </div>

              <h1 className="marketing-hero__headline">
                The showroom that makes software feel like a product launch.
              </h1>

              <div className="marketing-hero__deck">
                <p className="marketing-hero__supporting-copy">
                  Not a catalog wrapper. A composed, market-facing cover for branded software that
                  gives the system weight, desire, and a premium first impression before the deep
                  dive starts.
                </p>

                <div className="marketing-hero__headline-notes" aria-label="Hero qualities">
                  {headlineNotes.map((note) => (
                    <span className="marketing-hero__headline-note" key={note}>
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <article className="marketing-hero__brief">
              <div className="marketing-hero__brief-copy">
                <p className="marketing-hero__eyebrow">Showroom landing</p>
                <p className="marketing-hero__rail-title">Built to make the system feel desired.</p>
                <p className="marketing-hero__rail-copy">
                  This front door is meant to do more than list routes. It should frame the
                  showroom like a premium product story with taste, clarity, and commercial
                  confidence.
                </p>
              </div>

              <div className="marketing-hero__brief-side">
                <div className="marketing-hero__intro-signals" aria-label="Hero audiences">
                  {introSignals.map((signal) => (
                    <span className="marketing-hero__intro-signal" key={signal}>
                      {signal}
                    </span>
                  ))}
                </div>

                <div className="marketing-hero__actions">
                  <a
                    className="marketing-hero__action marketing-hero__action--primary"
                    href={primaryAction.href}
                  >
                    {primaryAction.label}
                  </a>
                  <a className="marketing-hero__action" href={secondaryAction.href}>
                    {secondaryAction.label}
                  </a>
                </div>
              </div>
            </article>
          </div>

          <aside className="marketing-hero__proof">
            {proofCards.map((card) => (
              <article
                className="marketing-hero__proof-card"
                data-emphasis={card.emphasis ? "true" : "false"}
                key={card.label}
              >
                <p className="marketing-hero__proof-label">{card.label}</p>
                <h2 className="marketing-hero__proof-title">{card.title}</h2>
                <p className="marketing-hero__proof-body">{card.body}</p>
              </article>
            ))}
          </aside>

          <div className="marketing-hero__stage">
            <div className="marketing-hero__stage-shell">
              <article className="marketing-hero__statement">
                <div className="marketing-hero__statement-meta">
                  <span>Operating thesis</span>
                  <span>Edition 01</span>
                </div>
                <div className="marketing-hero__statement-mark" aria-hidden="true">
                  01
                </div>
                <h2 className="marketing-hero__statement-title">
                  Brand should enter the room before the UI starts explaining itself.
                </h2>
                <p className="marketing-hero__statement-body">
                  The center of the hero now behaves like a campaign surface: stronger contrast,
                  tighter hierarchy, and a clearer point of view that makes the system feel chosen
                  rather than merely assembled.
                </p>

                <div className="marketing-hero__statement-tags" aria-label="Hero promise signals">
                  {statementTags.map((tag) => (
                    <span className="marketing-hero__statement-tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </article>

              <div className="marketing-hero__stage-panel">
                {stageHighlights.map((item) => (
                  <article className="marketing-hero__stage-item" key={item.label}>
                    <p className="marketing-hero__stage-item-label">{item.label}</p>
                    <p className="marketing-hero__stage-item-value">{item.value}</p>
                    <p className="marketing-hero__stage-item-detail">{item.detail}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="marketing-hero__manifesto">
            {manifestoItems.map((item) => (
              <article className="marketing-hero__manifesto-item" key={item.title}>
                <p className="marketing-hero__manifesto-title">{item.title}</p>
                <p className="marketing-hero__manifesto-detail">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="marketing-hero__proof-strip" aria-label="Proof strip">
          {proofStrip.map((item) => (
            <article className="marketing-hero__proof-strip-item" key={item.label}>
              <p className="marketing-hero__proof-strip-label">{item.label}</p>
              <p className="marketing-hero__proof-strip-value">{item.value}</p>
              <p className="marketing-hero__proof-strip-detail">{item.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export const marketingHeroStyles = `
  .marketing-hero {
    --marketing-hero-paper: var(--landing-paper, #f1f1ed);
    --marketing-hero-paper-strong: var(--landing-paper-strong, #e5e6e2);
    --marketing-hero-surface: var(--landing-surface, rgba(255, 255, 255, 0.86));
    --marketing-hero-surface-strong: var(--landing-surface-soft, #f6f6f3);
    --marketing-hero-ink: var(--landing-ink, #111111);
    --marketing-hero-ink-soft: var(--landing-ink-soft, #242424);
    --marketing-hero-muted: var(--landing-muted, #666765);
    --marketing-hero-subtle: var(--landing-subtle, #858681);
    --marketing-hero-line: var(--landing-line, rgba(17, 17, 17, 0.14));
    --marketing-hero-line-strong: var(--landing-line-strong, rgba(17, 17, 17, 0.24));
    --marketing-hero-shadow: var(--landing-shadow, 0 22px 56px rgba(17, 17, 17, 0.08));
    position: relative;
    overflow: hidden;
    border: 1px solid var(--marketing-hero-line);
    border-radius: 42px;
    background:
      radial-gradient(circle at top right, rgba(26, 26, 26, 0.08) 0, rgba(26, 26, 26, 0) 30%),
      radial-gradient(circle at left 18%, rgba(255, 255, 255, 0.95) 0, rgba(255, 255, 255, 0) 34%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, var(--marketing-hero-paper) 100%);
    box-shadow: var(--marketing-hero-shadow);
    isolation: isolate;
  }

  .marketing-hero::before,
  .marketing-hero::after {
    content: "";
    position: absolute;
    pointer-events: none;
  }

  .marketing-hero::before {
    inset: 0;
    background-image:
      linear-gradient(rgba(17, 17, 17, 0.028) 1px, transparent 1px),
      linear-gradient(90deg, rgba(17, 17, 17, 0.028) 1px, transparent 1px);
    background-size: 124px 124px;
    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.1) 100%);
    opacity: 0.42;
  }

  .marketing-hero::after {
    top: -24%;
    right: -10%;
    width: min(44vw, 560px);
    height: min(44vw, 560px);
    border-radius: 999px;
    background:
      radial-gradient(circle, rgba(18, 18, 18, 0.09) 0%, rgba(18, 18, 18, 0.025) 38%, rgba(18, 18, 18, 0) 72%);
    filter: blur(10px);
    animation: marketingHeroFloat 18s ease-in-out infinite;
  }

  .marketing-hero__ticker,
  .marketing-hero__frame,
  .marketing-hero__proof-strip {
    position: relative;
    z-index: 1;
  }

  .marketing-hero__ticker {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    padding: 14px 18px;
    border-bottom: 1px solid var(--marketing-hero-line);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.82) 0%, rgba(246, 246, 243, 0.7) 100%);
    backdrop-filter: blur(12px);
  }

  .marketing-hero__ticker-item {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    color: var(--marketing-hero-ink-soft);
    font-size: 0.73rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .marketing-hero__ticker-item::before {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: rgba(17, 17, 17, 0.72);
    box-shadow: 0 0 0 6px rgba(17, 17, 17, 0.07);
    flex-shrink: 0;
  }

  .marketing-hero__frame {
    padding: clamp(24px, 3.2vw, 40px);
  }

  .marketing-hero__grid {
    display: grid;
    grid-template-columns: minmax(0, 1.38fr) minmax(300px, 0.62fr);
    grid-template-areas:
      "main proof"
      "stage stage"
      "manifesto manifesto";
    gap: clamp(18px, 2vw, 30px);
    align-items: start;
  }

  .marketing-hero__main,
  .marketing-hero__proof,
  .marketing-hero__stage,
  .marketing-hero__manifesto {
    position: relative;
  }

  .marketing-hero__main {
    grid-area: main;
  }

  .marketing-hero__proof {
    grid-area: proof;
  }

  .marketing-hero__stage {
    grid-area: stage;
  }

  .marketing-hero__manifesto {
    grid-area: manifesto;
  }

  .marketing-hero__brief,
  .marketing-hero__proof-card {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(246, 246, 243, 0.88) 100%);
    border: 1px solid var(--marketing-hero-line);
    border-radius: 28px;
    backdrop-filter: blur(10px);
  }

  .marketing-hero__brief {
    display: grid;
    grid-template-columns: minmax(0, 1.18fr) minmax(250px, 0.82fr);
    gap: 16px 22px;
    align-items: start;
    margin-top: 18px;
    padding: 18px 20px;
    box-shadow: 0 14px 28px rgba(17, 17, 17, 0.04);
  }

  .marketing-hero__brief-copy,
  .marketing-hero__brief-side {
    display: grid;
    gap: 12px;
    min-width: 0;
  }

  .marketing-hero__brief-side {
    align-content: start;
    justify-items: start;
  }

  .marketing-hero__intro-signals {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .marketing-hero__intro-signal,
  .marketing-hero__headline-note,
  .marketing-hero__statement-tag,
  .marketing-hero__edition span {
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 0.74rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .marketing-hero__intro-signal,
  .marketing-hero__headline-note,
  .marketing-hero__edition span {
    border: 1px solid color-mix(in srgb, var(--marketing-hero-line-strong) 82%, transparent);
    background: rgba(255, 255, 255, 0.72);
    color: var(--marketing-hero-ink-soft);
  }

  .marketing-hero__eyebrow,
  .marketing-hero__kicker,
  .marketing-hero__proof-label,
  .marketing-hero__proof-strip-label,
  .marketing-hero__stage-item-label,
  .marketing-hero__statement-meta span {
    margin: 0;
    color: var(--marketing-hero-subtle);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .marketing-hero__rail-title {
    margin: 0;
    color: var(--marketing-hero-ink-soft);
    font-size: 1.28rem;
    line-height: 1.18;
    font-weight: 650;
    letter-spacing: -0.03em;
    text-wrap: balance;
  }

  .marketing-hero__rail-copy,
  .marketing-hero__supporting-copy,
  .marketing-hero__manifesto-detail,
  .marketing-hero__proof-body,
  .marketing-hero__proof-strip-detail,
  .marketing-hero__stage-item-detail,
  .marketing-hero__statement-body {
    margin: 0;
    color: var(--marketing-hero-muted);
    font-size: 0.98rem;
    line-height: 1.68;
  }

  .marketing-hero__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .marketing-hero__action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 46px;
    padding: 0 18px;
    border-radius: 999px;
    border: 1px solid var(--marketing-hero-line-strong);
    color: var(--marketing-hero-ink-soft);
    background: rgba(255, 255, 255, 0.76);
    font-size: 0.95rem;
    font-weight: 600;
    text-decoration: none;
    transition:
      transform 180ms ease,
      border-color 180ms ease,
      background-color 180ms ease,
      box-shadow 180ms ease;
  }

  .marketing-hero__action:hover,
  .marketing-hero__action:focus-visible {
    transform: translateY(-1px);
    border-color: rgba(17, 17, 17, 0.34);
    box-shadow: 0 14px 24px rgba(17, 17, 17, 0.08);
    outline: none;
  }

  .marketing-hero__action--primary {
    color: #fafaf8;
    background:
      linear-gradient(180deg, rgba(16, 16, 16, 0.97) 0%, rgba(39, 39, 39, 0.94) 100%);
    border-color: rgba(17, 17, 17, 0.94);
    box-shadow: 0 16px 28px rgba(17, 17, 17, 0.16);
  }

  .marketing-hero__lead {
    display: grid;
    gap: 18px;
  }

  .marketing-hero__lead-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .marketing-hero__edition {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
  }

  .marketing-hero__headline {
    margin: 0;
    max-width: 10.6ch;
    color: var(--marketing-hero-ink);
    font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
    font-size: clamp(3.4rem, 7.4vw, 6.3rem);
    line-height: 0.88;
    letter-spacing: -0.072em;
    text-wrap: balance;
  }

  .marketing-hero__deck {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 16px 22px;
    align-items: end;
  }

  .marketing-hero__supporting-copy {
    max-width: 57ch;
    font-size: 1.06rem;
    line-height: 1.7;
  }

  .marketing-hero__headline-notes {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
  }

  .marketing-hero__stage {
    position: relative;
    padding: 10px;
    border-radius: 34px;
    border: 1px solid var(--marketing-hero-line-strong);
    overflow: hidden;
    background:
      linear-gradient(160deg, rgba(255, 255, 255, 0.92) 0%, rgba(234, 234, 230, 0.92) 100%);
    box-shadow: 0 28px 54px rgba(17, 17, 17, 0.08);
  }

  .marketing-hero__stage::after {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(120deg, rgba(255, 255, 255, 0) 12%, rgba(255, 255, 255, 0.26) 48%, rgba(255, 255, 255, 0) 76%);
    opacity: 0.52;
    transform: translateX(-46%);
    animation: marketingHeroSweep 18s ease-in-out infinite;
  }

  .marketing-hero__stage-shell {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1.28fr) minmax(340px, 0.92fr);
    gap: 14px;
  }

  .marketing-hero__statement {
    position: relative;
    display: grid;
    gap: 16px;
    min-height: 100%;
    overflow: hidden;
    padding: 22px 24px 24px;
    border-radius: 28px;
    background:
      linear-gradient(180deg, rgba(24, 24, 24, 0.98) 0%, rgba(70, 70, 70, 0.96) 100%);
    color: #f7f7f4;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .marketing-hero__statement::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 52%);
  }

  .marketing-hero__statement-meta {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .marketing-hero__statement-mark {
    position: absolute;
    top: 6px;
    right: 18px;
    color: rgba(255, 255, 255, 0.08);
    font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
    font-size: clamp(5.2rem, 8vw, 8.4rem);
    line-height: 1;
    letter-spacing: -0.08em;
    animation: marketingHeroDrift 12s ease-in-out infinite;
  }

  .marketing-hero__statement-title {
    position: relative;
    z-index: 1;
    margin: 10px 0 0;
    max-width: 11ch;
    color: #fafaf7;
    font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
    font-size: clamp(2.35rem, 3.9vw, 3.8rem);
    line-height: 0.96;
    letter-spacing: -0.06em;
    text-wrap: balance;
  }

  .marketing-hero__statement-body {
    position: relative;
    z-index: 1;
    max-width: 52ch;
    color: rgba(250, 250, 247, 0.76);
    font-size: 1rem;
  }

  .marketing-hero__statement-tags {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;
  }

  .marketing-hero__statement-tag {
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.06);
    color: rgba(250, 250, 247, 0.88);
  }

  .marketing-hero__stage-panel {
    display: grid;
    gap: 10px;
  }

  .marketing-hero__stage-item {
    padding: 18px 18px 20px;
    border: 1px solid rgba(17, 17, 17, 0.08);
    border-radius: 22px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.86) 0%, rgba(249, 249, 246, 0.94) 100%);
    box-shadow: 0 10px 24px rgba(17, 17, 17, 0.04);
  }

  .marketing-hero__stage-item-label {
    margin-bottom: 8px;
  }

  .marketing-hero__stage-item-value,
  .marketing-hero__manifesto-title,
  .marketing-hero__proof-title,
  .marketing-hero__proof-strip-value {
    margin: 0;
    color: var(--marketing-hero-ink-soft);
    font-size: 1.08rem;
    line-height: 1.3;
    font-weight: 650;
  }

  .marketing-hero__stage-item-value {
    font-size: 1.12rem;
    letter-spacing: -0.02em;
    text-wrap: balance;
  }

  .marketing-hero__stage-item-detail {
    margin-top: 8px;
    font-size: 0.93rem;
    line-height: 1.58;
  }

  .marketing-hero__manifesto {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    padding-top: 18px;
    border-top: 1px solid var(--marketing-hero-line);
  }

  .marketing-hero__manifesto-item {
    display: grid;
    gap: 8px;
    min-width: 0;
    padding-top: 12px;
    border-top: 1px solid color-mix(in srgb, var(--marketing-hero-line) 76%, transparent);
  }

  .marketing-hero__manifesto-title {
    font-size: 1rem;
    letter-spacing: -0.02em;
  }

  .marketing-hero__manifesto-detail {
    font-size: 0.94rem;
    line-height: 1.58;
  }

  .marketing-hero__proof {
    display: grid;
    gap: 12px;
  }

  .marketing-hero__proof-card {
    padding: 18px 18px 20px;
    box-shadow: 0 12px 28px rgba(17, 17, 17, 0.04);
  }

  .marketing-hero__proof-card[data-emphasis="true"] {
    transform: translateY(-6px);
    border-color: rgba(17, 17, 17, 0.2);
    background:
      linear-gradient(180deg, rgba(252, 252, 250, 0.98) 0%, rgba(238, 238, 233, 0.98) 100%);
    box-shadow: 0 18px 34px rgba(17, 17, 17, 0.07);
  }

  .marketing-hero__proof-title {
    margin-top: 10px;
    font-size: 1.34rem;
    line-height: 1.06;
    letter-spacing: -0.04em;
    text-wrap: balance;
  }

  .marketing-hero__proof-body {
    margin-top: 10px;
    font-size: 0.95rem;
    line-height: 1.62;
  }

  .marketing-hero__proof-strip {
    display: grid;
    grid-template-columns: 1.12fr repeat(3, minmax(0, 1fr));
    gap: 0;
    margin-top: clamp(24px, 3vw, 32px);
    padding-top: 18px;
    border-top: 1px solid var(--marketing-hero-line);
  }

  .marketing-hero__proof-strip-item {
    display: grid;
    gap: 10px;
    min-width: 0;
    padding: 0 18px;
    border-left: 1px solid color-mix(in srgb, var(--marketing-hero-line) 82%, transparent);
  }

  .marketing-hero__proof-strip-item:first-child {
    padding-left: 0;
    border-left: none;
  }

  .marketing-hero__proof-strip-item:last-child {
    padding-right: 0;
  }

  .marketing-hero__proof-strip-value {
    font-size: 1.02rem;
    line-height: 1.35;
    letter-spacing: -0.02em;
  }

  .marketing-hero__proof-strip-detail {
    font-size: 0.9rem;
    line-height: 1.56;
  }

  @keyframes marketingHeroFloat {
    0%,
    100% {
      transform: translate3d(0, 0, 0) scale(1);
    }

    50% {
      transform: translate3d(-18px, 12px, 0) scale(1.03);
    }
  }

  @keyframes marketingHeroSweep {
    0%,
    100% {
      transform: translateX(-46%);
    }

    50% {
      transform: translateX(32%);
    }
  }

  @keyframes marketingHeroDrift {
    0%,
    100% {
      transform: translate3d(0, 0, 0);
    }

    50% {
      transform: translate3d(-10px, 8px, 0);
    }
  }

  @media (max-width: 1260px) {
    .marketing-hero__grid {
      grid-template-columns: minmax(0, 1.12fr) minmax(260px, 0.88fr);
    }

    .marketing-hero__brief {
      grid-template-columns: minmax(0, 1fr);
    }

    .marketing-hero__proof {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .marketing-hero__proof-strip {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px 0;
    }

    .marketing-hero__proof-strip-item:nth-child(odd) {
      padding-left: 0;
      border-left: none;
    }

    .marketing-hero__proof-strip-item:nth-child(even) {
      padding-right: 0;
    }
  }

  @media (max-width: 980px) {
    .marketing-hero__ticker,
    .marketing-hero__grid,
    .marketing-hero__stage-shell,
    .marketing-hero__manifesto,
    .marketing-hero__proof,
    .marketing-hero__proof-strip,
    .marketing-hero__deck {
      grid-template-columns: minmax(0, 1fr);
    }

    .marketing-hero__headline,
    .marketing-hero__statement-title {
      max-width: none;
    }

    .marketing-hero__grid {
      grid-template-areas:
        "main"
        "stage"
        "proof"
        "manifesto";
    }

    .marketing-hero__lead-meta {
      align-items: flex-start;
      flex-direction: column;
    }

    .marketing-hero__edition,
    .marketing-hero__headline-notes {
      justify-content: flex-start;
    }
    .marketing-hero__proof-card,
    .marketing-hero__brief,
    .marketing-hero__statement {
      border-radius: 24px;
    }

    .marketing-hero__proof-card[data-emphasis="true"] {
      transform: none;
    }

    .marketing-hero__proof-strip-item {
      padding: 0;
      border-left: none;
    }
  }

  @media (max-width: 640px) {
    .marketing-hero {
      border-radius: 30px;
    }

    .marketing-hero__frame {
      padding: 18px;
    }

    .marketing-hero__ticker {
      padding: 14px 16px;
    }

    .marketing-hero__ticker-item {
      white-space: normal;
    }

    .marketing-hero__brief,
    .marketing-hero__proof-card {
      padding: 18px 16px;
    }

    .marketing-hero__stage {
      padding: 8px;
    }

    .marketing-hero__statement,
    .marketing-hero__stage-item {
      padding-left: 18px;
      padding-right: 18px;
    }

    .marketing-hero__headline {
      font-size: clamp(2.75rem, 14vw, 4.1rem);
      line-height: 0.92;
    }

    .marketing-hero__supporting-copy,
    .marketing-hero__statement-body {
      font-size: 1rem;
      line-height: 1.64;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .marketing-hero::after,
    .marketing-hero__stage::after,
    .marketing-hero__statement-mark,
    .marketing-hero__action {
      animation: none !important;
      transition: none !important;
    }
  }
`;
