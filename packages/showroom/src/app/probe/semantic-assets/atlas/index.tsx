'use client';

import { Suspense, useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ICON_NAMES,
  Icon,
  type IconName,
} from '@rottay/design-system/icons';
import {
  BRAND_MARK_NAMES,
  CLOUD_PROVIDERS,
  CLOUD_SERVICES,
  BrandMark,
  CloudServiceMark,
  type BrandMarkName,
  type CloudProvider,
  type CloudService,
} from '@rottay/design-system/marks';
import {
  FEATURE_PICTOGRAM_NAMES,
  FeaturePictogram,
  type FeaturePictogramName,
} from '@rottay/design-system/pictograms';

import { TortureSurface } from '../../../../components/torture-surface';
import {
  CRA17_ASSET_SIZES,
  CRA17_CANONICAL_ICON_NAMES,
  CRA17_CORPORA,
  CRA17_DIRECTIONS,
  CRA17_ENGINES,
  CRA17_PICTOGRAM_SIZES,
  CRA17_TENANTS,
  CRA17_THEMES,
  cra17ProbeHref,
  resolveCra17Axes,
  type Cra17Axes,
  type Cra17Corpus,
  type Cra17Direction,
  type Cra17Engine,
  type Cra17Tenant,
  type Cra17Theme,
} from '../fixtures';

type AssetClass =
  | 'brand-mark'
  | 'cloud-service-mark'
  | 'feature-pictogram'
  | 'icon';

interface AssetEntry {
  readonly key: string;
  readonly label: string;
  readonly render: (size: number) => ReactNode;
}

const TENANT_LABELS: Readonly<Record<Cra17Tenant, string>> = {
  bithire: 'BitHire',
  themanagementmiami: 'The Management',
};

function iconEntries(names: readonly IconName[]): readonly AssetEntry[] {
  return names.map((name) => ({
    key: name,
    label: name,
    render: (size) => (
      <Icon
        name={name}
        size={size}
        tone="primary"
        mirrored="auto"
        decorative
      />
    ),
  }));
}

const ALL_ICON_ENTRIES = iconEntries(ICON_NAMES);
const CANONICAL_ICON_ENTRIES = iconEntries(CRA17_CANONICAL_ICON_NAMES);

function brandEntries(theme: Cra17Theme): readonly AssetEntry[] {
  return BRAND_MARK_NAMES.map((name: BrandMarkName) => ({
    key: name,
    label: name,
    render: (size) => (
      <BrandMark
        name={name}
        size={size}
        // The supplier variants are named for their intended ground: `dark`
        // contains the light artwork that remains legible on a dark surface.
        variant={theme}
        decorative
      />
    ),
  }));
}

const CLOUD_ENTRIES: readonly AssetEntry[] = CLOUD_PROVIDERS.flatMap(
  (provider: CloudProvider) =>
    CLOUD_SERVICES.map((service: CloudService) => ({
      key: `${provider}.${service}`,
      label: `${provider} · ${service}`,
      render: (size: number) => (
        <CloudServiceMark
          provider={provider}
          service={service}
          size={size}
          decorative
        />
      ),
    })),
);

const PICTOGRAM_ENTRIES: readonly AssetEntry[] = FEATURE_PICTOGRAM_NAMES.map(
  (name: FeaturePictogramName) => ({
    key: name,
    label: name,
    render: (size) => (
      <FeaturePictogram name={name} size={size} tone="brand" decorative />
    ),
  }),
);

const CLASS_COPY: Readonly<
  Record<
    AssetClass,
    { readonly eyebrow: string; readonly title: string; readonly description: string }
  >
> = {
  icon: {
    eyebrow: 'Functional semantics',
    title: 'Icon corpus',
    description:
      'Every governed semantic role from ICON_NAMES. Directional roles use mirrored="auto" for the RTL audit.',
  },
  'brand-mark': {
    eyebrow: 'Trademark identities',
    title: 'BrandMark',
    description:
      'The fixed, compliance-audited brand corpus with the contrast variant selected for the active ground.',
  },
  'cloud-service-mark': {
    eyebrow: 'Provider services',
    title: 'CloudServiceMark',
    description:
      'Every provider/service pair from the public mark registry at the shared optical-size axis.',
  },
  'feature-pictogram': {
    eyebrow: 'Explanatory artwork',
    title: 'FeaturePictogram',
    description:
      'All eight registered product illustrations at their legal 32–96px explanatory-artwork scale.',
  },
};

const STYLES = `
  .cra17-atlas {
    min-height: 100vh;
    padding: 24px;
    color: var(--ds-color-text-primary);
    background:
      radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--ds-color-primary) 14%, transparent), transparent 32rem),
      var(--ds-color-bg-primary);
    font-family: var(--ds-font-family-base, system-ui, sans-serif);
  }

  .cra17-shell {
    width: min(1440px, 100%);
    margin: 0 auto;
  }

  .cra17-header {
    display: grid;
    gap: 10px;
    padding: 22px;
    border: 1px solid var(--ds-color-border);
    border-radius: var(--ds-radius-xl, 20px);
    background: color-mix(in srgb, var(--ds-color-bg-elevated) 92%, transparent);
    box-shadow: var(--ds-shadow-sm);
  }

  .cra17-kicker,
  .cra17-section-eyebrow,
  .cra17-axis-label {
    font-size: 11px;
    font-weight: 750;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .cra17-kicker,
  .cra17-axis-label {
    color: color-mix(
      in srgb,
      var(--ds-color-primary) 55%,
      var(--ds-color-text-primary)
    );
  }

  .cra17-title,
  .cra17-section-title,
  .cra17-copy,
  .cra17-section-copy,
  .cra17-axis-label {
    margin: 0;
  }

  .cra17-title {
    font-size: clamp(26px, 4vw, 46px);
    line-height: 1.02;
    letter-spacing: -0.04em;
  }

  .cra17-copy,
  .cra17-section-copy {
    max-width: 78ch;
    color: var(--ds-color-text-secondary);
    font-size: 14px;
    line-height: 1.55;
  }

  .cra17-controls {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 8px;
  }

  .cra17-axis {
    min-width: 0;
    padding: 12px;
    border: 1px solid var(--ds-color-border-subtle, var(--ds-color-border));
    border-radius: var(--ds-radius-lg, 14px);
    background: var(--ds-color-bg-secondary);
  }

  .cra17-axis-options {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }

  .cra17-axis-link {
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: 5px 9px;
    border: 1px solid var(--ds-color-border);
    border-radius: var(--ds-radius-full, 999px);
    color: var(--ds-color-text-secondary);
    background: var(--ds-color-bg-elevated);
    font-size: 12px;
    font-weight: 650;
    text-decoration: none;
  }

  .cra17-axis-link[aria-current='true'] {
    border-color: var(--ds-color-primary);
    color: var(--ds-color-text-on-primary, Canvas);
    background: var(--ds-color-primary);
  }

  .cra17-sections {
    display: grid;
    min-width: 0;
    gap: 22px;
    margin-top: 22px;
  }

  .cra17-section {
    min-width: 0;
    overflow: clip;
    border: 1px solid var(--ds-color-border);
    border-radius: var(--ds-radius-xl, 20px);
    background: var(--ds-color-bg-elevated);
    box-shadow: var(--ds-shadow-sm);
  }

  .cra17-section[data-cra17-asset-class='icon'] { --cra17-accent: var(--ds-color-primary); }
  .cra17-section[data-cra17-asset-class='brand-mark'] { --cra17-accent: var(--ds-color-info, var(--ds-color-primary)); }
  .cra17-section[data-cra17-asset-class='cloud-service-mark'] { --cra17-accent: var(--ds-color-warning, var(--ds-color-primary)); }
  .cra17-section[data-cra17-asset-class='feature-pictogram'] { --cra17-accent: var(--ds-color-ai, var(--ds-color-primary)); }

  .cra17-section-header {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 20px;
    padding: 18px 20px;
    border-block-end: 1px solid var(--ds-color-border);
    box-shadow: inset 4px 0 0 var(--cra17-accent);
  }

  [dir='rtl'] .cra17-section-header {
    box-shadow: inset -4px 0 0 var(--cra17-accent);
  }

  .cra17-section-heading {
    display: grid;
    gap: 5px;
  }

  .cra17-section-eyebrow {
    color: color-mix(
      in srgb,
      var(--cra17-accent) 55%,
      var(--ds-color-text-primary)
    );
  }
  .cra17-section-title { font-size: 20px; letter-spacing: -0.02em; }

  .cra17-count {
    flex: 0 0 auto;
    padding: 5px 9px;
    border-radius: var(--ds-radius-full, 999px);
    color: var(--ds-color-text-secondary);
    background: var(--ds-color-bg-secondary);
    font: 650 11px/1 var(--ds-font-family-mono, monospace);
  }

  .cra17-matrix {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    overflow-x: auto;
  }

  .cra17-matrix-row {
    display: grid;
    grid-template-columns: minmax(210px, 1.35fr) repeat(4, minmax(86px, 1fr));
    min-width: 620px;
    border-block-end: 1px solid var(--ds-color-border-subtle, var(--ds-color-border));
  }

  .cra17-matrix-row:last-child { border-block-end: 0; }

  .cra17-matrix-row[data-cra17-matrix-header='true'] {
    position: sticky;
    top: 0;
    z-index: 1;
    background: var(--ds-color-bg-secondary);
  }

  .cra17-name,
  .cra17-size-label,
  .cra17-cell {
    min-width: 0;
    min-height: 54px;
    border-inline-end: 1px solid var(--ds-color-border-subtle, var(--ds-color-border));
  }

  .cra17-matrix-row > :last-child { border-inline-end: 0; }

  .cra17-name,
  .cra17-size-label {
    display: flex;
    align-items: center;
    padding: 10px 14px;
  }

  .cra17-name {
    overflow-wrap: anywhere;
    color: var(--ds-color-text-secondary);
    font: 600 12px/1.35 var(--ds-font-family-mono, monospace);
  }

  .cra17-size-label {
    justify-content: center;
    color: var(--ds-color-text-muted, var(--ds-color-text-secondary));
    font: 650 11px/1 var(--ds-font-family-mono, monospace);
  }

  .cra17-cell {
    display: grid;
    place-items: center;
    padding: 10px;
    color: var(--cra17-accent);
    background: color-mix(in srgb, var(--cra17-accent) 3%, transparent);
  }

  .cra17-cell[data-cra17-forced-colors-target='requested'] {
    outline: 1px dashed var(--cra17-accent);
    outline-offset: -4px;
  }

  @media (max-width: 760px) {
    .cra17-atlas { padding: 12px; }
    .cra17-controls { grid-template-columns: 1fr 1fr; }
    .cra17-section-header { align-items: start; flex-direction: column; }
    .cra17-matrix { overflow-x: visible; }
    .cra17-matrix-row {
      grid-template-columns: minmax(126px, 1.7fr) repeat(4, minmax(42px, 1fr));
      min-width: 0;
    }
    .cra17-name {
      padding: 9px 10px;
      font-size: 10px;
    }
    .cra17-size-label,
    .cra17-cell { padding: 8px 4px; }
  }

  @media (forced-colors: active) {
    .cra17-atlas {
      color: CanvasText;
      background: Canvas;
    }

    .cra17-header,
    .cra17-section,
    .cra17-axis,
    .cra17-axis-link,
    .cra17-cell {
      border-color: CanvasText;
      color: CanvasText;
      background: Canvas;
      forced-color-adjust: auto;
    }

    .cra17-axis-link[aria-current='true'] {
      color: HighlightText;
      background: Highlight;
    }
  }
`;

function axisLink(
  axes: Cra17Axes,
  patch: Partial<Cra17Axes>,
  label: string,
  current: boolean,
) {
  const href = cra17ProbeHref({ ...axes, ...patch });
  return (
    <a
      key={`${label}:${href}`}
      className="cra17-axis-link"
      href={href}
      aria-current={current ? 'true' : undefined}
    >
      {label}
    </a>
  );
}

function AxisControls({ axes }: { axes: Cra17Axes }) {
  return (
    <nav className="cra17-controls" aria-label="CRA17 semantic asset capture axes">
      <div className="cra17-axis" data-cra17-control="tenant">
        <p className="cra17-axis-label">Tenant fixture</p>
        <div className="cra17-axis-options">
          {CRA17_TENANTS.map((tenant) =>
            axisLink(
              axes,
              { tenant },
              TENANT_LABELS[tenant],
              axes.tenant === tenant,
            ),
          )}
        </div>
      </div>

      <div className="cra17-axis" data-cra17-control="theme">
        <p className="cra17-axis-label">Theme</p>
        <div className="cra17-axis-options">
          {CRA17_THEMES.map((theme: Cra17Theme) =>
            axisLink(axes, { theme }, theme, axes.theme === theme),
          )}
        </div>
      </div>

      <div className="cra17-axis" data-cra17-control="engine">
        <p className="cra17-axis-label">Engine</p>
        <div className="cra17-axis-options">
          {CRA17_ENGINES.map((engine: Cra17Engine) =>
            axisLink(axes, { engine }, engine, axes.engine === engine),
          )}
        </div>
      </div>

      <div className="cra17-axis" data-cra17-control="corpus">
        <p className="cra17-axis-label">Corpus</p>
        <div className="cra17-axis-options">
          {CRA17_CORPORA.map((corpus: Cra17Corpus) =>
            axisLink(axes, { corpus }, corpus, axes.corpus === corpus),
          )}
        </div>
      </div>

      <div className="cra17-axis" data-cra17-control="direction">
        <p className="cra17-axis-label">Direction</p>
        <div className="cra17-axis-options">
          {CRA17_DIRECTIONS.map((direction: Cra17Direction) =>
            axisLink(
              axes,
              { direction },
              direction.toUpperCase(),
              axes.direction === direction,
            ),
          )}
        </div>
      </div>

      <div className="cra17-axis" data-cra17-control="forced-colors">
        <p className="cra17-axis-label">Forced colors hooks</p>
        <div className="cra17-axis-options">
          {axisLink(
            axes,
            { forcedColorsAudit: false },
            'Ready',
            !axes.forcedColorsAudit,
          )}
          {axisLink(
            axes,
            { forcedColorsAudit: true },
            'Audit',
            axes.forcedColorsAudit,
          )}
        </div>
      </div>
    </nav>
  );
}

function AssetSection({
  assetClass,
  entries,
  sizes,
  axes,
  sizeContract,
}: {
  assetClass: AssetClass;
  entries: readonly AssetEntry[];
  sizes: readonly number[];
  axes: Cra17Axes;
  sizeContract: string;
}) {
  const copy = CLASS_COPY[assetClass];

  return (
    <section
      className="cra17-section"
      data-cra17-asset-class={assetClass}
      data-cra17-asset-count={entries.length}
      data-cra17-size-contract={sizeContract}
      data-cra17-section-ready="true"
    >
      <header className="cra17-section-header">
        <div className="cra17-section-heading">
          <span className="cra17-section-eyebrow">{copy.eyebrow}</span>
          <h2 className="cra17-section-title">{copy.title}</h2>
          <p className="cra17-section-copy">{copy.description}</p>
        </div>
        <span className="cra17-count">{entries.length} assets</span>
      </header>

      <div className="cra17-matrix" data-cra17-matrix={assetClass}>
        <div className="cra17-matrix-row" data-cra17-matrix-header="true">
          <span className="cra17-size-label">semantic name</span>
          {sizes.map((size) => (
            <span className="cra17-size-label" key={size}>
              {size}px
            </span>
          ))}
        </div>

        {entries.map((entry) => (
          <div
            className="cra17-matrix-row"
            key={entry.key}
            data-cra17-asset-name={entry.key}
          >
            <span className="cra17-name">{entry.label}</span>
            {sizes.map((size) => (
              <span
                className="cra17-cell"
                key={size}
                data-cra17-asset-size={size}
                data-cra17-capture-key={`${axes.tenant}:${axes.engine}:${axes.theme}:${axes.direction}:${assetClass}:${entry.key}:${size}`}
                data-cra17-forced-colors-target={
                  axes.forcedColorsAudit ? 'requested' : 'ready'
                }
              >
                {entry.render(size)}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function SemanticAssetAtlasContent() {
  const searchParams = useSearchParams();
  const axes = useMemo(
    () => resolveCra17Axes(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const brands = useMemo(() => brandEntries(axes.theme), [axes.theme]);
  const icons = axes.corpus === 'canonical'
    ? CANONICAL_ICON_ENTRIES
    : ALL_ICON_ENTRIES;

  return (
    <TortureSurface
      engine={axes.engine}
      fixture={axes.tenant}
      ground={axes.theme}
      rtl={axes.direction === 'rtl'}
    >
      <main
        className="cra17-atlas"
        data-cra17-probe="semantic-assets"
        data-cra17-ready="true"
        data-cra17-tenant={axes.tenant}
        data-cra17-engine={axes.engine}
        data-cra17-theme={axes.theme}
        data-cra17-corpus={axes.corpus}
        data-cra17-direction={axes.direction}
        data-cra17-forced-colors-hook="media-query-ready"
        data-cra17-forced-colors-audit={
          axes.forcedColorsAudit ? 'requested' : 'ready'
        }
        data-cra17-icon-count={icons.length}
        data-cra17-role-cell-count={icons.length * CRA17_ASSET_SIZES.length}
        data-cra17-brand-mark-count={BRAND_MARK_NAMES.length}
        data-cra17-cloud-mark-count={CLOUD_PROVIDERS.length * CLOUD_SERVICES.length}
        data-cra17-feature-pictogram-count={FEATURE_PICTOGRAM_NAMES.length}
      >
        <style>{STYLES}</style>
        <div className="cra17-shell">
          <header className="cra17-header">
            <span className="cra17-kicker">CRA17 · governed asset evidence</span>
            <h1 className="cra17-title">Semantic asset atlas</h1>
            <p className="cra17-copy">
              One html-anchored tenant per load. The URL axes keep BitHire and
              The Management on the same fixture/provider path while exposing
              deterministic capture targets for theme, direction, optical size,
              and operating-system forced-colors audits.
            </p>
            <AxisControls axes={axes} />
          </header>

          <div className="cra17-sections">
            <AssetSection
              assetClass="icon"
              entries={icons}
              sizes={CRA17_ASSET_SIZES}
              axes={axes}
              sizeContract="12|16|20|24"
            />
            <AssetSection
              assetClass="brand-mark"
              entries={brands}
              sizes={CRA17_ASSET_SIZES}
              axes={axes}
              sizeContract="12|16|20|24"
            />
            <AssetSection
              assetClass="cloud-service-mark"
              entries={CLOUD_ENTRIES}
              sizes={CRA17_ASSET_SIZES}
              axes={axes}
              sizeContract="12|16|20|24"
            />
            <AssetSection
              assetClass="feature-pictogram"
              entries={PICTOGRAM_ENTRIES}
              sizes={CRA17_PICTOGRAM_SIZES}
              axes={axes}
              sizeContract="32|48|64|96"
            />
          </div>
        </div>
      </main>
    </TortureSurface>
  );
}

export function SemanticAssetAtlas() {
  return (
    <Suspense fallback={null}>
      <SemanticAssetAtlasContent />
    </Suspense>
  );
}
