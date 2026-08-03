'use client';

/**
 * @fileoverview TenantThemePreviewReport -- the quiet, honest read-out beneath
 * the Brand Studio live preview.
 *
 * Renders three things from {@link useTenantThemePreview}: the compiler's
 * structured validation issues (when the document is invalid), the APCA
 * autocorrections the compiler applied (each named foreground token, its ground,
 * the hex it moved from and to, and the Lc it reached), and font-pack warnings
 * when a referenced `--ds-font-pack-*` is not loaded in the host document. It is
 * purely presentational and domain-agnostic: it knows nothing about tenants,
 * candidates, roles, or events.
 *
 * @module Patterns/Customization/BrandStudio/Runtime/TenantThemePreview/Report
 * @package @rottay/design-system
 */

import type { TenantThemeValidationIssue } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import { Badge, Box, Flex, Stack, Text } from '@/ui/primitives';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

// Sourced from the owner barrel rather than the sibling leaf modules so the
// report stays a downstream consumer of its own owner, not a peer of them.
import type {
  TenantThemeContrastAdjustment,
  TenantThemePackWarning,
} from '../index';

/**
 * Floor-resolving translator for the report's own chrome copy (same optional
 * `components` channel as the owner module; never echoes a raw key).
 */
type TenantReportTranslator = (key: string, floor: string, params?: Record<string, string | number>) => string;

function useTenantReportCopy(): TenantReportTranslator {
  const i18n = useOptionalTranslation('components');
  return (key, floor, params) => i18n?.tOr(key, floor, params) ?? floor;
}

export interface TenantThemePreviewReportProps {
  /** Structured validation issues; a non-empty list renders the invalid-document panel. */
  issues?: readonly TenantThemeValidationIssue[] | null;
  /** APCA autocorrections recorded on the compiled artifact. */
  adjustments?: readonly TenantThemeContrastAdjustment[];
  /** Referenced font packs not loaded in the host document. */
  packWarnings?: readonly TenantThemePackWarning[];
}

/**
 * Readable phrases for the foreground tokens the compiler most commonly snaps,
 * so the quiet list reads as prose. Unknown tokens fall back to their raw name;
 * the hex/Lc detail line below is always exact.
 */
const ADJUSTMENT_LABELS: Record<string, string> = {
  '--ds-button-primary-color': 'Text on primary button',
  '--ds-button-secondary-color': 'Text on secondary button',
  '--ds-button-success-color': 'Text on success button',
  '--ds-button-warning-color': 'Text on warning button',
  '--ds-button-error-color': 'Text on error button',
  '--ds-button-info-color': 'Text on info button',
  '--ds-table-header-color': 'Table header text',
  '--ds-sidebar-text': 'Sidebar text',
  '--ds-sidebar-item-color-active': 'Active sidebar item text',
  '--ds-color-text-primary': 'Body text',
};

function adjustmentLabel(token: string): string {
  return ADJUSTMENT_LABELS[token] ?? token;
}

/* All geometry/paint is skin-owned (`presentation/components/skin/
   brand-studio.css`): the former runtime inline styles were drained onto the
   report's stable data-parts. */

function IssuesView({
  issues,
}: {
  issues: readonly TenantThemeValidationIssue[];
}): React.ReactElement {
  const t = useTenantReportCopy();
  return (
    <Box
      className="ds-pattern-brand-studio__preview-issues"
      data-part="preview-issues"
      data-state="invalid"
    >
      <Flex align="center" justify="between" gap={8} wrap="wrap">
        <Text
          className="ds-pattern-brand-studio__preview-report-title"
          data-part="preview-report-title"
          size="xs"
          weight="semibold"
        >
          {t('brandStudio.tenantReport.documentInvalid', 'Document not valid')}
        </Text>
        <Badge variant="error" data-state="invalid">
          {issues.length}{' '}
          {issues.length === 1
            ? t('brandStudio.tenantReport.issueOne', 'issue')
            : t('brandStudio.tenantReport.issueOther', 'issues')}
        </Badge>
      </Flex>
      <Stack
        className="ds-pattern-brand-studio__preview-report-list"
        data-part="preview-report-list"
        spacing="xs"
      >
        {issues.map((issue) => (
          <Box
            key={`${issue.path}:${issue.code}:${issue.message}`}
            className="ds-pattern-brand-studio__preview-issue"
            data-part="preview-issue"
            data-code={issue.code}
          >
            <Text
              className="ds-pattern-brand-studio__preview-report-lead"
              data-part="preview-report-lead"
              size="xs"
              weight="semibold"
            >
              {issue.path}
            </Text>
            <Text
              className="ds-pattern-brand-studio__preview-issue-message"
              data-part="preview-issue-message"
              size="xs"
            >
              {issue.message}
            </Text>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function AdjustmentsView({
  adjustments,
}: {
  adjustments: readonly TenantThemeContrastAdjustment[];
}): React.ReactElement {
  const t = useTenantReportCopy();
  return (
    <Box
      className="ds-pattern-brand-studio__preview-adjustments"
      data-part="preview-adjustments"
      data-state="adjusted"
    >
      <Flex align="center" justify="between" gap={8} wrap="wrap">
        <Text
          className="ds-pattern-brand-studio__preview-report-title"
          data-part="preview-report-title"
          size="xs"
          weight="semibold"
        >
          {t('brandStudio.tenantReport.contrastAutocorrections', 'Contrast autocorrections')}
        </Text>
        <Badge variant="secondary">
          {adjustments.length}{' '}
          {adjustments.length === 1
            ? t('brandStudio.tenantReport.changeOne', 'change')
            : t('brandStudio.tenantReport.changeOther', 'changes')}
        </Badge>
      </Flex>
      <Stack
        className="ds-pattern-brand-studio__preview-report-list"
        data-part="preview-report-list"
        spacing="xs"
      >
        {adjustments.map((adjustment) => (
          <Box
            key={`${adjustment.token}:${adjustment.pairedWith}`}
            className="ds-pattern-brand-studio__preview-adjustment"
            data-part="preview-adjustment"
          >
            <Text
              className="ds-pattern-brand-studio__preview-report-lead"
              data-part="preview-report-lead"
              size="xs"
              weight="semibold"
            >
              {t('brandStudio.tenantReport.adjustment', '{label} adjusted {from} → {to} to reach Lc {lc}', {
                label: adjustmentLabel(adjustment.token),
                from: adjustment.from,
                to: adjustment.to,
                lc: Math.round(adjustment.lcAfter),
              })}
            </Text>
            <Text
              className="ds-pattern-brand-studio__preview-adjustment-detail"
              data-part="preview-adjustment-detail"
              size="xs"
            >
              {t('brandStudio.tenantReport.adjustmentDetail', 'on {pairedWith} · was Lc {lc}', {
                pairedWith: adjustment.pairedWith,
                lc: Math.round(adjustment.lcBefore),
              })}
            </Text>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function PackWarningsView({
  packWarnings,
}: {
  packWarnings: readonly TenantThemePackWarning[];
}): React.ReactElement {
  const t = useTenantReportCopy();
  return (
    <Box
      className="ds-pattern-brand-studio__preview-pack-warnings"
      data-part="preview-pack-warnings"
      data-state="warning"
    >
      <Flex align="center" justify="between" gap={8} wrap="wrap">
        <Text
          className="ds-pattern-brand-studio__preview-report-title"
          data-part="preview-report-title"
          size="xs"
          weight="semibold"
        >
          {t('brandStudio.tenantReport.fontPacksNotLoaded', 'Font packs not loaded')}
        </Text>
        <Badge variant="warning" data-state="warning">
          {packWarnings.length}{' '}
          {packWarnings.length === 1
            ? t('brandStudio.tenantReport.packOne', 'pack')
            : t('brandStudio.tenantReport.packOther', 'packs')}
        </Badge>
      </Flex>
      <Stack
        className="ds-pattern-brand-studio__preview-report-list"
        data-part="preview-report-list"
        spacing="xs"
      >
        {packWarnings.map((warning) => (
          <Box
            key={`${warning.referencedBy}:${warning.variable}`}
            className="ds-pattern-brand-studio__preview-pack-warning"
            data-part="preview-pack-warning"
          >
            <Text
              className="ds-pattern-brand-studio__preview-report-lead"
              data-part="preview-report-lead"
              size="xs"
              weight="semibold"
            >
              {t('brandStudio.tenantReport.packMissing', '{variable} is referenced but not loaded', {
                variable: warning.variable,
              })}
            </Text>
            <Text
              className="ds-pattern-brand-studio__preview-pack-warning-detail"
              data-part="preview-pack-warning-detail"
              size="xs"
            >
              {t(
                'brandStudio.tenantReport.packMissingDetail',
                '{referencedBy} falls through to its authored fallback fonts',
                { referencedBy: warning.referencedBy }
              )}
            </Text>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

/**
 * Report surface for the tenant-theme live preview: invalid-document issues,
 * APCA autocorrections, and font-pack warnings. Renders nothing when a valid
 * document produced no adjustments and no warnings.
 */
export function TenantThemePreviewReport({
  issues,
  adjustments = [],
  packWarnings = [],
}: TenantThemePreviewReportProps): React.ReactElement | null {
  const hasIssues = (issues?.length ?? 0) > 0;
  if (hasIssues) {
    return (
      <Stack
        className="ds-pattern-brand-studio__preview-report"
        data-part="preview-report"
        data-state="invalid"
        spacing="sm"
      >
        <IssuesView issues={issues as readonly TenantThemeValidationIssue[]} />
      </Stack>
    );
  }

  if (adjustments.length === 0 && packWarnings.length === 0) {
    return null;
  }

  return (
    <Stack
      className="ds-pattern-brand-studio__preview-report"
      data-part="preview-report"
      data-state="valid"
      spacing="sm"
    >
      {adjustments.length > 0 ? <AdjustmentsView adjustments={adjustments} /> : null}
      {packWarnings.length > 0 ? <PackWarningsView packWarnings={packWarnings} /> : null}
    </Stack>
  );
}
