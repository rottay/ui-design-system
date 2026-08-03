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
 * `presentation/components/skin/branding-preview-sandbox.css`; chrome copy
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
import { Badge, Box, Button, Card, Heading, Input, Text } from '../../../primitives';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

// Lazy import to avoid pulling appearance compiler into main bundle
// when sandbox is not used (tree-shaken)
import { appearanceToVariables } from '@/infrastructure/compilers/kernel/runtime/appearance';

interface BrandingPreviewSandboxProps {
  /** Proposed tenant appearance to preview. */
  appearance: TenantAppearance;
  /** Additional raw CSS variables to inject. */
  extraVars?: Record<string, string>;
  /** Show section labels. Default: true */
  showLabels?: boolean;
  /** Compact mode (fewer components). Default: false */
  compact?: boolean;
}

/**
 * Live preview sandbox for tenant branding changes.
 * Renders representative DS primitives in an isolated CSS scope.
 */
export function BrandingPreviewSandbox({
  appearance,
  extraVars,
  showLabels = true,
  compact = false,
}: BrandingPreviewSandboxProps): React.ReactElement {
  // Optional channel with an English floor: the sandbox renders standalone
  // (no I18nProvider) without crashing, and never echoes a raw key.
  const i18n = useOptionalTranslation('components');
  const t = (key: string, floor: string, params?: Record<string, string | number>): string =>
    i18n?.tOr(key, floor, params) ?? floor;

  const sandboxId = useId().replace(/:/g, '');
  const scopeAttr = `data-preview-${sandboxId}`;

  // Compile appearance to CSS variables
  const cssVars = useMemo(() => {
    const vars = appearanceToVariables(appearance);
    if (extraVars) Object.assign(vars, extraVars);
    return vars;
  }, [appearance, extraVars]);

  // Build scoped CSS string
  const scopedCss = useMemo(() => {
    const entries = Object.entries(cssVars);
    if (entries.length === 0) return '';
    const declarations = entries.map(([k, v]) => `  ${k}: ${v};`).join('\n');
    return `[${scopeAttr}] {\n${declarations}\n}`;
  }, [cssVars, scopeAttr]);

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
          {t('brandingPreview.varsApplied', '{count} CSS variables applied', { count: Object.keys(cssVars).length })}
        </Box>
      </div>
    </>
  );
}
