/**
 * @fileoverview Branding Preview Sandbox - Live preview of branding changes.
 *
 * Renders a gallery of REAL DS primitives (Button, Input, Card, Badge,
 * Typography) with a proposed TenantAppearance applied in an isolated CSS
 * scope -- the preview shows the actual component chrome reading the
 * injected variables, never a hand-painted mock of it (a mock drifts; the
 * real primitive cannot). Used by tenant admins to preview branding changes
 * before saving.
 *
 * Uses CSS scope isolation via a per-instance data attribute to prevent
 * style collisions with the admin's own dashboard. The mini table strip
 * stays a CHANNEL MIRROR on purpose: it is not a control, it reads the
 * `--ds-table-*` appearance channels directly (mounting a full DataTable
 * with sorting chrome would drown the swatch). All geometry lives in
 * `presentation/components/skin/branding-preview-sandbox/index.css`; chrome copy
 * resolves through the optional `components` i18n channel with English
 * floors.
 *
 * @example
 * ```tsx
 * import { BrandingPreviewSandbox } from '@rottay/design-system';
 *
 * <BrandingPreviewSandbox
 *   appearance={{
 *     general: { palette: { primary: '#FF0000' } },
 *     advanced: { chrome: { controls: { buttonPrimary: { bg: '#FF0000' } } } },
 *   }}
 * />
 * ```
 *
 * @module BrandingPreviewSandbox
 * @category Patterns/Customization
 * @package @rottay/design-system
 */

'use client';

import React, { useMemo, useId } from 'react';
import type { TenantAppearance } from '../../../../foundation/contracts/composition/tenants/themes';
import { Badge } from '../../../primitives/display/badge';
import { Box } from '../../../primitives/layout/box';
import { Button } from '../../../primitives/inputs/button';
import { Card } from '../../../primitives/display/card';
import { Heading } from '../../../primitives/display/typography/compound/heading';
import { Input } from '../../../primitives/inputs/input';
import { Text } from '../../../primitives/display/typography/compound/text';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

import type { FirstPartyVerticalId } from '@/foundation/contracts/kernel/verticals';
import {
  TENANT_THEME_SCHEMA_VERSION,
  type TenantThemeDocument,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  compileThemeIntent,
  previewThemeIntent,
  staticThemeIntent,
} from '@/infrastructure/compilers/runtime/theme';
import { containerScope } from '@/infrastructure/compilers/kernel/foundation/css/tenant-selectors';
import { emitThemeCss } from '@/infrastructure/compilers/runtime/theme/runtime/emission';
import { isSafePreviewCssValue } from '@/infrastructure/runtime/tenant/runtime/preview-scope';

interface BrandingPreviewSandboxProps {
  /** Proposed tenant appearance to preview. */
  appearance: TenantAppearance;
  /** Show section labels. Default: true */
  showLabels?: boolean;
  /** Compact mode (fewer components). Default: false */
  compact?: boolean;
  /**
   * The first-party vertical the proposed appearance is resolved against.
   *
   * A `TenantAppearance` is a DELTA; it has no channels of its own until it is
   * resolved over a vertical's theme, which is why the canonical pipeline takes
   * an intent naming a vertical and not an appearance. It used to take the
   * baseline `Theme` itself, which made every caller an authority on what a
   * baseline is; naming the vertical leaves that to the roster. Defaults to
   * Rottay — the DS's own reference vertical — so the sandbox still renders
   * standalone; a console previewing its own tenant passes that tenant's
   * vertical instead.
   */
  vertical?: FirstPartyVerticalId;
  /**
   * The tenant the preview is scoped for. Defaults to the vertical, which is
   * the standalone case: nobody's tenant in particular.
   */
  slug?: string;
}

/**
 * Live preview sandbox for tenant branding changes.
 * Renders representative DS primitives in an isolated CSS scope.
 */
export function BrandingPreviewSandbox({
  appearance,
  showLabels = true,
  compact = false,
  vertical = 'rottay',
  slug = vertical,
}: BrandingPreviewSandboxProps): React.ReactElement {
  // Optional channel with an English floor: the sandbox renders standalone
  // (no I18nProvider) without crashing, and never echoes a raw key.
  const i18n = useOptionalTranslation('components');
  const t = (key: string, floor: string, params?: Record<string, string | number>): string =>
    i18n?.tOr(key, floor, params) ?? floor;

  const sandboxId = useId().replace(/:/g, '');
  const scopeAttr = `data-preview-${sandboxId}`;

  /**
   * The proposed appearance, through the ONE pipeline.
   *
   * The appearance is migrated into the same `ThemeLayerPatch` a stored tenant
   * document produces, resolved over the baseline as a `preview` intent, and
   * lowered by `compileTheme`. What the sandbox paints is the DELTA against the
   * untouched baseline — the same rule the DB artifact uses — so the scope still
   * carries exactly the channels the appearance moves and nothing else.
   *
   * Fail-closed: a document the migration refuses paints nothing rather than
   * falling back to a second, hand-rolled projection.
   */
  const cssVars = useMemo(() => {
    const vars: Record<string, string> = {};
    const document: TenantThemeDocument = appearance.advanced
      ? {
          schemaVersion: TENANT_THEME_SCHEMA_VERSION,
          mode: 'advanced',
          visualFoundation: appearance,
        }
      : {
          schemaVersion: TENANT_THEME_SCHEMA_VERSION,
          mode: 'simple',
          appearance: appearance.general ?? {},
        };
    try {
      // The engine, the baseline and the migration's default mode are the
      // door's. This block used to state all three itself, and got the third
      // wrong: it migrated with a hardcoded `'light'` while the publish path
      // used the baseline's own default mode. On Rottay, whose default is dark,
      // that put the same authored seed in two different blocks — the preview
      // repainted the dark canvas for a change the artifact wrote into light.
      const proposed = compileThemeIntent(
        previewThemeIntent({ vertical, slug, document }),
      ).compiled;
      const untouched = compileThemeIntent(
        staticThemeIntent(vertical, slug),
      ).compiled;
      for (const [name, value] of Object.entries(proposed.cssVariables)) {
        if (untouched.cssVariables[name] !== value) vars[name] = value;
      }
    } catch {
      // An unmigratable appearance is a refused preview, never a second door.
    }
    return vars;
  }, [appearance, vertical, slug]);

  // This string reaches dangerouslySetInnerHTML, so every declaration passes
  // the governed preview guard before it is emitted.
  const appliedVars = useMemo(
    () =>
      Object.entries(cssVars).filter(
        ([name, value]) => /^--ds-[a-z0-9-]+$/i.test(name) && isSafePreviewCssValue(value),
      ),
    [cssVars],
  );

  // Emission is the emission owner's, not this component's: a pattern that
  // assembles its own declarations is a second CSS grammar to keep in step.
  const scopedCss = useMemo(() => {
    if (appliedVars.length === 0) return '';
    return emitThemeCss(
      {
        cssVariables: Object.fromEntries(appliedVars),
        modeBlocks: [],
        runtime: { personality: {}, tokenOverrides: {} },
      },
      containerScope(`[${scopeAttr}]`),
    );
  }, [appliedVars, scopeAttr]);

  return (
    <>
      {/* Inject scoped CSS */}
      <style dangerouslySetInnerHTML={{ __html: scopedCss }} />

      {/* Sandbox container */}
      <div
        {...{ [scopeAttr]: '' }}
        className="ds-pattern-branding-preview-sandbox"
        data-part="root"
        data-state={compact ? 'compact' : 'full'}
      >
        {/* Buttons section -- real Buttons reading the scoped chrome vars */}
        {showLabels && (
          <Box data-part="header" data-state="buttons">
            {t('brandingPreview.section.buttons', 'Buttons')}
          </Box>
        )}
        <Box data-part="surface" data-state="buttons">
          <Button variant="primary">{t('brandingPreview.button.primary', 'Primary')}</Button>
          <Button variant="secondary">{t('brandingPreview.button.secondary', 'Secondary')}</Button>
          <Button variant="default">{t('brandingPreview.button.default', 'Default')}</Button>
          <Button variant="ghost">{t('brandingPreview.button.ghost', 'Ghost')}</Button>
        </Box>

        {/* Inputs section -- real Inputs (read-only: the preview is inert) */}
        {showLabels && (
          <Box data-part="header" data-state="inputs">
            {t('brandingPreview.section.inputs', 'Inputs')}
          </Box>
        )}
        <Box data-part="surface" data-state="inputs">
          <Input
            data-part="input"
            placeholder={t('brandingPreview.input.placeholder', 'Text input...')}
            readOnly
          />
          <Input
            data-part="input"
            status="error"
            placeholder={t('brandingPreview.input.errorPlaceholder', 'Error state')}
            readOnly
          />
        </Box>

        {/* Cards section -- real Cards */}
        {showLabels && (
          <Box data-part="header" data-state="cards">
            {t('brandingPreview.section.cards', 'Cards')}
          </Box>
        )}
        <Box data-part="surface" data-state="cards">
          {/* Card drops a consumer data-part in every engine (its root
              carries Card's own forced part) -- the surviving component
              class is the authoritative hook for the preview width. */}
          <Card
            className="ds-branding-preview-sandbox__card"
            data-size={compact ? 'compact' : 'full'}
            variant="outlined"
          >
            <Card.Body>
              <Text data-part="preview-card-title" weight="semibold">
                {t('brandingPreview.card.title', 'Card Title')}
              </Text>
              <Text data-part="preview-card-body" size="sm">
                {t('brandingPreview.card.body', 'Card body text with secondary color.')}
              </Text>
            </Card.Body>
          </Card>
          {!compact && (
            <Card className="ds-branding-preview-sandbox__card" data-state="elevated" variant="elevated">
              <Card.Body>
                <Text data-part="preview-card-title" weight="semibold">
                  {t('brandingPreview.card.elevatedTitle', 'Elevated Card')}
                </Text>
                <Text data-part="preview-card-body" size="sm">
                  {t('brandingPreview.card.elevatedBody', 'With hover shadow applied.')}
                </Text>
              </Card.Body>
            </Card>
          )}
        </Box>

        {/* Badges section -- real Badges on the semantic tone axis */}
        {showLabels && (
          <Box data-part="header" data-state="badges">
            {t('brandingPreview.section.badges', 'Badges')}
          </Box>
        )}
        <Box data-part="surface" data-state="badges">
          <Badge tone="success">{t('brandingPreview.badge.active', 'Active')}</Badge>
          <Badge tone="warning">{t('brandingPreview.badge.warning', 'Warning')}</Badge>
          <Badge tone="danger">{t('brandingPreview.badge.error', 'Error')}</Badge>
          <Badge tone="info">{t('brandingPreview.badge.info', 'Info')}</Badge>
        </Box>

        {/* Table preview (mini) -- a CHANNEL MIRROR strip reading the
            `--ds-table-*` appearance vars directly (not a control; a full
            DataTable would drown the swatch). Logical alignment only. */}
        {!compact && (
          <>
            {showLabels && (
              <Box data-part="header" data-state="table">
                {t('brandingPreview.section.table', 'Table')}
              </Box>
            )}
            <Box data-part="table">
              <Box data-part="table-head">
                <Box data-part="preview-table-cell" data-variant="head" data-span="wide">
                  {t('brandingPreview.table.name', 'Name')}
                </Box>
                <Box data-part="preview-table-cell" data-variant="head">
                  {t('brandingPreview.table.status', 'Status')}
                </Box>
                <Box data-part="preview-table-cell" data-variant="head" data-align="end">
                  {t('brandingPreview.table.date', 'Date')}
                </Box>
              </Box>
              {/* Sample rows ride the same copy channel as the rest of the
                  chrome (neutral fixture data, English floors). */}
              {[
                {
                  name: t('brandingPreview.table.sampleNameA', 'John Doe'),
                  date: t('brandingPreview.table.sampleDateA', 'Apr 17, 2026'),
                },
                {
                  name: t('brandingPreview.table.sampleNameB', 'Jane Smith'),
                  date: t('brandingPreview.table.sampleDateB', 'Apr 16, 2026'),
                },
              ].map((row, i) => (
                <Box key={row.name} data-part="surface" data-state={i % 2 === 1 ? 'striped' : 'default'}>
                  <Box data-part="preview-table-cell" data-variant="name" data-span="wide">
                    {row.name}
                  </Box>
                  <Box data-part="preview-table-cell" data-variant="status">
                    <Badge tone="success">{t('brandingPreview.badge.active', 'Active')}</Badge>
                  </Box>
                  <Box data-part="preview-table-cell" data-variant="date" data-align="end">
                    {row.date}
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        )}

        {/* Typography preview -- real Heading/Text reading the scoped fonts */}
        {!compact && (
          <>
            {showLabels && (
              <Box data-part="header" data-state="typography">
                {t('brandingPreview.section.typography', 'Typography')}
              </Box>
            )}
            <Box data-part="surface" data-state="typography">
              <Heading level="h3" data-part="title">
                {t('brandingPreview.typography.heading', 'Heading Text')}
              </Heading>
              <Text data-part="subtitle" data-variant="body">
                {t(
                  'brandingPreview.typography.body',
                  'Body text in the base font family. This is how paragraph text will look with the selected fonts and colors.'
                )}
              </Text>
              <Text data-part="subtitle" data-variant="code">
                {'const monospace = "code preview";'}
              </Text>
            </Box>
          </>
        )}

        {/* Footer: var count */}
        <Box data-part="subtitle" data-variant="variable-count">
          {/* Counts what the guard let through, not what was proposed. */}
          {t('brandingPreview.varsApplied', '{count} CSS variables applied', { count: appliedVars.length })}
        </Box>
      </div>
    </>
  );
}
