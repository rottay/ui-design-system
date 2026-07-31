'use client';

/**
 * BillingSurface
 *
 * Config-driven subscription management page: current plan overview, usage
 * meters, invoice history, and saved payment methods, stacked (sections) or
 * tabbed. The app owns billing data and side effects; the surface owns
 * composition, states, and visual rhythm.
 *
 * Composition: PageShellSurface chrome + Card sections + Progress meters +
 * the shared state kits (loading skeleton, error with retry). Visible copy
 * resolves through `tSurfaceOr` under `surfaces.billing.*` with an English
 * floor, and visual defaults cascade config -> product profile -> DS defaults
 * via `useSurfaceProfileDefaultsWithOverrides`.
 */

import { densityScopeAttributes } from '@/infrastructure/runtime/foundation/density';
import { useBreakpoints } from '@/infrastructure/runtime/responsive/composition/react/provider/breakpoint-state';
import { FadeIn } from '@/graphics/motion';
import { ActionDownloadIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-download';
import { BillingCreditCardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/billing-credit-card';
import { BillingInvoiceIcon } from '@/graphics/icons/presentation/semantic/generated/roles/billing-invoice';
import { BillingSubscriptionIcon } from '@/graphics/icons/presentation/semantic/generated/roles/billing-subscription';
import { DataChartIcon } from '@/graphics/icons/presentation/semantic/generated/roles/data-chart';
import React from 'react';
import { Button, Card, Flex, Progress, Stack, Tabs, Tag, Text } from '../../../../../primitives';
import type { BillingSurfaceConfig, BillingInvoice } from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import {
  SurfaceErrorState,
  SurfaceLoadingSkeleton,
} from '../../../../runtime/helpers/states';
import { useSurfaceTranslations } from '../../../../runtime/helpers/states/i18n';
import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
import { resolveStackSpacing } from '../../../../runtime/profile-defaults/personality';
import type { CardVariant } from '../../../../../primitives/display/Card/contracts';

export interface BillingSurfaceProps {
  config: BillingSurfaceConfig;
  loading?: boolean;
  /** Load/render failure surfaced as an error state (ListSurface prop precedent). */
  error?: unknown;
  /** Retry handler rendered inside the error state when provided. */
  onRetry?: () => void | Promise<void>;
}

/** Card variant the active profile cascade resolved; sections share it. */
type SectionCardVariant = CardVariant;

/**
 * Section header: governed semantic icon (decorative; the title carries the
 * meaning) next to the section title. Local to the surface — every section
 * header renders the same rhythm.
 */
function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}): React.ReactElement {
  return (
    <Flex gap={8} align="center">
      {icon}
      <Text size="md" weight="semibold">
        {title}
      </Text>
    </Flex>
  );
}

/** Semantic tone for the closed status vocabulary the contract documents. */
function invoiceStatusTone(status: BillingInvoice['status']): 'success' | 'warning' | 'neutral' {
  if (status === 'paid') return 'success';
  if (status === 'pending') return 'warning';
  return 'neutral';
}

function PlanSection({
  config,
  cardVariant,
}: {
  config: BillingSurfaceConfig;
  cardVariant: SectionCardVariant;
}): React.ReactElement {
  const { tSurfaceOr } = useSurfaceTranslations();

  // Full escape hatch: when the app provides a custom plan renderer, the
  // surface yields entirely. This allows Stripe-specific or custom plan
  // UI without forking the billing surface.
  if (config.presentation.renderPlan) {
    return <>{config.presentation.renderPlan()}</>;
  }

  const { currentPlan } = config.behavior;
  const hasActions = Boolean(config.behavior.onUpgrade || config.behavior.onCancel);

  return (
    <Card variant={cardVariant}>
      <Card.Body>
        <Stack spacing="md">
          <Flex justify="between" align="center" gap={12} wrap="wrap">
            <Stack spacing="xs">
              <Flex gap={8} align="center" wrap="wrap">
                <BillingSubscriptionIcon decorative size={20} />
                <Text size="xl" weight="bold">
                  {currentPlan.name}
                </Text>
                <Tag tone="primary">{tSurfaceOr('billing.plan_current_badge', 'Current plan')}</Tag>
              </Flex>
              <Text color="muted" className="ds-billing__muted-text">
                {currentPlan.price} / {currentPlan.interval}
              </Text>
            </Stack>
            {hasActions && (
              <Flex gap={8} wrap="wrap">
                {config.behavior.onUpgrade && (
                  <Button variant="primary" size="sm" onClick={config.behavior.onUpgrade}>
                    {tSurfaceOr('billing.action_upgrade', 'Upgrade')}
                  </Button>
                )}
                {/*
                  Cancel fires the contract callback directly: the contract
                  declares no confirmation step, so the surface does not invent
                  one (registered debt — a destructive action this direct wants
                  a contract-declared confirm).
                */}
                {config.behavior.onCancel && (
                  <Button variant="danger" size="sm" onClick={config.behavior.onCancel}>
                    {tSurfaceOr('billing.action_cancel', 'Cancel')}
                  </Button>
                )}
              </Flex>
            )}
          </Flex>
          {currentPlan.features.length > 0 && (
            <Stack spacing="xs">
              {currentPlan.features.map((feature, i) => (
                <Text
                  key={i}
                  size="sm"
                  color="muted"
                  className="ds-billing__muted-text"
                >
                  {feature}
                </Text>
              ))}
            </Stack>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
}

// UsageSection renders only when usage data exists. Returning null keeps the
// page layout clean for plans that do not have metered features (a rendered
// empty section is pinned against by the surface's own integration tests).
function UsageSection({
  config,
  cardVariant,
}: {
  config: BillingSurfaceConfig;
  cardVariant: SectionCardVariant;
}): React.ReactElement | null {
  const { tSurfaceOr } = useSurfaceTranslations();
  const { usage } = config.behavior;

  if (!usage || usage.length === 0) return null;

  return (
    <Card variant={cardVariant}>
      <Card.Body>
        <Stack spacing="md">
          <SectionHeader
            icon={<DataChartIcon decorative size={16} />}
            title={tSurfaceOr('billing.usage_title', 'Usage')}
          />
          {usage.map((item, i) => {
            // Guard against division by zero for unlimited usage items where
            // the limit may be 0 or unset.
            const percentage = item.limit > 0 ? Math.round((item.current / item.limit) * 100) : 0;
            return (
              <Stack key={i} spacing="xs">
                <Flex justify="between" align="center" gap={12} wrap="wrap">
                  <Text weight="medium">{item.label}</Text>
                  <Text size="xs" color="muted" className="ds-billing__muted-text">
                    {item.current} / {item.limit} {item.unit}
                  </Text>
                </Flex>
                {/*
                  Progress percent is a 0-100 contract, so over-limit usage is
                  capped for geometry and signalled through the error status
                  instead of overflowing the track.
                */}
                <Progress
                  percent={Math.min(percentage, 100)}
                  status={percentage >= 100 ? 'error' : undefined}
                />
              </Stack>
            );
          })}
        </Stack>
      </Card.Body>
    </Card>
  );
}

function InvoicesSection({
  config,
  cardVariant,
}: {
  config: BillingSurfaceConfig;
  cardVariant: SectionCardVariant;
}): React.ReactElement | null {
  const { tSurfaceOr } = useSurfaceTranslations();
  const { invoices } = config.behavior;

  if (!invoices || invoices.length === 0) return null;

  return (
    <Card variant={cardVariant}>
      <Card.Body>
        <Stack spacing="md">
          <SectionHeader
            icon={<BillingInvoiceIcon decorative size={16} />}
            title={tSurfaceOr('billing.invoices_title', 'Invoices')}
          />
          <Stack
            spacing="none"
            role="list"
            aria-label={tSurfaceOr('billing.invoices_list_aria', 'Invoice history')}
          >
            {invoices.map((invoice) => (
              <Flex
                key={invoice.id}
                className="ds-billing__divider"
                role="listitem"
                justify="between"
                align="center"
                gap={12}
                wrap="wrap"
              >
                <Flex gap={12} align="center" wrap="wrap">
                  <Text weight="medium">{invoice.date}</Text>
                  <Text className="ds-billing__amount">{invoice.amount}</Text>
                  {/*
                    The status string is app data rendered verbatim (pinned);
                    only its tone is mapped onto the semantic Tag channel.
                  */}
                  <Tag tone={invoiceStatusTone(invoice.status)}>{invoice.status}</Tag>
                </Flex>
                {invoice.downloadUrl && config.behavior.onDownloadInvoice && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<ActionDownloadIcon decorative size={15} />}
                    aria-label={tSurfaceOr('billing.invoice_download_aria', 'Download invoice {date}', {
                      date: invoice.date,
                    })}
                    onClick={() => config.behavior.onDownloadInvoice?.(invoice.id)}
                  >
                    {tSurfaceOr('billing.action_download', 'Download')}
                  </Button>
                )}
              </Flex>
            ))}
          </Stack>
        </Stack>
      </Card.Body>
    </Card>
  );
}

function PaymentMethodsSection({
  config,
  cardVariant,
}: {
  config: BillingSurfaceConfig;
  cardVariant: SectionCardVariant;
}): React.ReactElement | null {
  const { tSurfaceOr } = useSurfaceTranslations();
  const { paymentMethods } = config.behavior;

  if (!paymentMethods || paymentMethods.length === 0) return null;

  return (
    <Card variant={cardVariant}>
      <Card.Body>
        <Stack spacing="md">
          <SectionHeader
            icon={<BillingCreditCardIcon decorative size={16} />}
            title={tSurfaceOr('billing.payment_methods_title', 'Payment Methods')}
          />
          <Stack
            spacing="none"
            role="list"
            aria-label={tSurfaceOr('billing.payment_methods_list_aria', 'Saved payment methods')}
          >
            {paymentMethods.map((method) => (
              <Flex
                key={method.id}
                className="ds-billing__divider"
                role="listitem"
                justify="between"
                align="center"
                gap={12}
                wrap="wrap"
              >
                <Flex gap={12} align="center" wrap="wrap">
                  <Text weight="medium">{method.type}</Text>
                  <Text color="muted" className="ds-billing__muted-text">
                    **** {method.last4}
                  </Text>
                  <Text size="xs" color="muted" className="ds-billing__muted-text">
                    {tSurfaceOr('billing.payment_expiry', 'Exp {expiry}', {
                      expiry: method.expiry,
                    })}
                  </Text>
                  {method.isDefault && (
                    <Tag tone="primary">{tSurfaceOr('billing.payment_default_badge', 'Default')}</Tag>
                  )}
                </Flex>
              </Flex>
            ))}
          </Stack>
        </Stack>
      </Card.Body>
    </Card>
  );
}

/**
 * Structural loading body: one skeleton card per canonical billing region
 * (plan, meters, invoices) so the placeholder mirrors the final footprint
 * instead of the shell's whole-page placeholder — PatternPageShell's
 * `loading` early return never renders children, so a shaped body skeleton
 * can only exist here (SU01 idiom). Row counts scale with density.
 */
function BillingLoadingBody({
  cardVariant,
  isCompact,
}: {
  cardVariant: SectionCardVariant;
  isCompact: boolean;
}): React.ReactElement {
  return (
    <>
      <Card variant={cardVariant}>
        <Card.Body>
          <SurfaceLoadingSkeleton rows={2} />
        </Card.Body>
      </Card>
      <Card variant={cardVariant}>
        <Card.Body>
          <SurfaceLoadingSkeleton rows={isCompact ? 4 : 2} />
        </Card.Body>
      </Card>
      <Card variant={cardVariant}>
        <Card.Body>
          <SurfaceLoadingSkeleton rows={isCompact ? 5 : 3} />
        </Card.Body>
      </Card>
    </>
  );
}

export function BillingSurface({
  config,
  loading = false,
  error,
  onRetry,
}: BillingSurfaceProps): React.ReactElement {
  const profileDefaults = useSurfaceProfileDefaultsWithOverrides(
    config.visual?.profileOverrides
  );
  const { tSurfaceOr } = useSurfaceTranslations();
  const { isMobile } = useBreakpoints();
  const useTabs = config.visual.layout === 'tabs';
  const cardVariant = profileDefaults.cardVariant;
  const isCompact = profileDefaults.density === 'compact';

  // Error short-circuits the whole body: the shell keeps the page chrome so
  // retry never loses context (ListSurface precedent).
  if (error) {
    return (
      <PageShellSurface chrome={config.presentation.chrome} loading={false}>
        <SurfaceErrorState error={error} onRetry={onRetry} />
      </PageShellSurface>
    );
  }

  const sections = loading ? (
    <BillingLoadingBody cardVariant={cardVariant} isCompact={isCompact} />
  ) : (
    <>
      <PlanSection config={config} cardVariant={cardVariant} />
      <UsageSection config={config} cardVariant={cardVariant} />
      <InvoicesSection config={config} cardVariant={cardVariant} />
      <PaymentMethodsSection config={config} cardVariant={cardVariant} />
    </>
  );

  // Tab layout groups plan+usage together (they are conceptually one unit),
  // while invoices and payment methods become separate tabs. Empty sections
  // are excluded from the tab bar entirely to avoid confusing empty tabs.
  // Tabs stamps its own root (`data-part="root"`) and does not forward
  // arbitrary data-* attrs, so the state attributes live on the sections
  // root only; the surface classes land on the Tabs root either way.
  const content = useTabs ? (
    <Tabs
      className="ds-surface ds-billing ds-billing--tabs"
      items={[
        {
          key: 'plan',
          label: tSurfaceOr('billing.tab_plan', 'Plan'),
          children: loading ? (
            <Stack spacing="lg">
              <BillingLoadingBody cardVariant={cardVariant} isCompact={isCompact} />
            </Stack>
          ) : (
            <Stack spacing="lg">
              <PlanSection config={config} cardVariant={cardVariant} />
              <UsageSection config={config} cardVariant={cardVariant} />
            </Stack>
          ),
        },
        ...(!loading && config.behavior.invoices && config.behavior.invoices.length > 0
          ? [
              {
                key: 'invoices',
                label: tSurfaceOr('billing.invoices_title', 'Invoices'),
                children: <InvoicesSection config={config} cardVariant={cardVariant} />,
              },
            ]
          : []),
        ...(!loading &&
        config.behavior.paymentMethods &&
        config.behavior.paymentMethods.length > 0
          ? [
              {
                key: 'payment',
                label: tSurfaceOr('billing.payment_methods_title', 'Payment Methods'),
                children: <PaymentMethodsSection config={config} cardVariant={cardVariant} />,
              },
            ]
          : []),
      ]}
    />
  ) : (
    <Stack
      className="ds-surface ds-billing ds-billing--sections"
      data-part="root"
      data-view="sections"
      data-mobile={isMobile ? 'true' : 'false'}
      {...densityScopeAttributes(profileDefaults.density)}
      data-loading={loading ? 'true' : 'false'}
      aria-busy={loading}
      spacing={resolveStackSpacing(profileDefaults.sectionSpacing)}
    >
      {sections}
    </Stack>
  );

  return (
    <PageShellSurface chrome={config.presentation.chrome} loading={false}>
      {profileDefaults.animateEntrance ? (
        <FadeIn durationMs={profileDefaults.entranceDuration}>{content}</FadeIn>
      ) : (
        content
      )}
    </PageShellSurface>
  );
}
