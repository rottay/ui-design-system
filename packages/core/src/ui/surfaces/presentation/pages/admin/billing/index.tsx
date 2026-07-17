'use client';

/**
 * @fileoverview BillingSurface -- subscription management page shell.
 * @description Composes plan overview, usage meters, invoice history, and payment
 * method management. Supports tabbed and sectioned layouts. The app owns billing
 * logic and data fetching; this surface standardizes the composition.
 */

import React from 'react';
import { Badge, Box, Button, Card, Flex, Grid, Progress, Stack, Tabs, Tag, Text } from '../../../../../primitives';
import type { BillingSurfaceConfig } from '../../../../foundation/contracts';
import { PageShellSurface } from '../../../../composition/layout/page-shell';
import { SurfaceActionBar } from '../../../../runtime/helpers/rendering';
import { SurfaceEmptyState } from '../../../../runtime/helpers/states';

export interface BillingSurfaceProps {
  config: BillingSurfaceConfig;
  loading?: boolean;
}

const BILLING_ROW_STYLE: React.CSSProperties = {
  padding: '8px 0',
};

function PlanSection({ config }: { config: BillingSurfaceConfig }): React.ReactElement {
  // Full escape hatch: when the app provides a custom plan renderer, the
  // surface yields entirely. This allows Stripe-specific or custom plan
  // UI without forking the billing surface.
  if (config.presentation.renderPlan) {
    return <>{config.presentation.renderPlan()}</>;
  }

  const { currentPlan } = config.behavior;

  return (
    <Card variant="outlined">
      <Card.Body>
        <Stack spacing="md">
          <Flex justify="between" align="center">
            <Stack spacing="xs">
              <Text style={{ fontSize: 20, fontWeight: 700 }}>{currentPlan.name}</Text>
              <Text
                className="ds-billing__muted-text"
                data-part="muted-text"
              >
                {currentPlan.price} / {currentPlan.interval}
              </Text>
            </Stack>
            <Flex gap={8}>
              {config.behavior.onUpgrade && (
                <Button variant="primary" size="sm" onClick={config.behavior.onUpgrade}>
                  <Text>Upgrade</Text>
                </Button>
              )}
              {config.behavior.onCancel && (
                <Button variant="danger" size="sm" onClick={config.behavior.onCancel}>
                  <Text>Cancel</Text>
                </Button>
              )}
            </Flex>
          </Flex>
          {currentPlan.features.length > 0 && (
            <Stack spacing="xs">
              {currentPlan.features.map((feature, i) => (
                <Text
                  key={i}
                  className="ds-billing__muted-text"
                  data-part="muted-text"
                  style={{ fontSize: 14 }}
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
// page layout clean for plans that do not have metered features.
function UsageSection({ config }: { config: BillingSurfaceConfig }): React.ReactElement | null {
  const { usage } = config.behavior;

  if (!usage || usage.length === 0) return null;

  return (
    <Card variant="outlined">
      <Card.Body>
        <Stack spacing="md">
          <Text style={{ fontSize: 16, fontWeight: 600 }}>Usage</Text>
          {usage.map((item, i) => {
            // Guard against division by zero for unlimited usage items where
            // the limit may be 0 or unset.
            const percentage = item.limit > 0 ? Math.round((item.current / item.limit) * 100) : 0;
            return (
              <Stack key={i} spacing="xs">
                <Flex justify="between" align="center">
                  <Text style={{ fontWeight: 500 }}>{item.label}</Text>
                  <Text
                    className="ds-billing__muted-text"
                    data-part="muted-text"
                    style={{ fontSize: 12 }}
                  >
                    {item.current} / {item.limit} {item.unit}
                  </Text>
                </Flex>
                <Progress percent={percentage} />
              </Stack>
            );
          })}
        </Stack>
      </Card.Body>
    </Card>
  );
}

function InvoicesSection({ config }: { config: BillingSurfaceConfig }): React.ReactElement | null {
  const { invoices } = config.behavior;

  if (!invoices || invoices.length === 0) return null;

  return (
    <Card variant="outlined">
      <Card.Body>
        <Stack spacing="md">
          <Text style={{ fontSize: 16, fontWeight: 600 }}>Invoices</Text>
          {invoices.map((invoice) => (
            <Flex
              key={invoice.id}
              className="ds-billing__divider"
              justify="between"
              align="center"
              style={BILLING_ROW_STYLE}
            >
              <Flex gap={12} align="center">
                <Text style={{ fontWeight: 500 }}>{invoice.date}</Text>
                <Text>{invoice.amount}</Text>
                <Tag variant={invoice.status === 'paid' ? 'success' : invoice.status === 'pending' ? 'warning' : 'default'}>
                  {invoice.status}
                </Tag>
              </Flex>
              {invoice.downloadUrl && config.behavior.onDownloadInvoice && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => config.behavior.onDownloadInvoice?.(invoice.id)}
                >
                  <Text>Download</Text>
                </Button>
              )}
            </Flex>
          ))}
        </Stack>
      </Card.Body>
    </Card>
  );
}

function PaymentMethodsSection({ config }: { config: BillingSurfaceConfig }): React.ReactElement | null {
  const { paymentMethods } = config.behavior;

  if (!paymentMethods || paymentMethods.length === 0) return null;

  return (
    <Card variant="outlined">
      <Card.Body>
        <Stack spacing="md">
          <Text style={{ fontSize: 16, fontWeight: 600 }}>Payment Methods</Text>
          {paymentMethods.map((method) => (
            <Flex
              key={method.id}
              className="ds-billing__divider"
              justify="between"
              align="center"
              style={BILLING_ROW_STYLE}
            >
              <Flex gap={12} align="center">
                <Text style={{ fontWeight: 500 }}>{method.type}</Text>
                <Text
                  className="ds-billing__muted-text"
                  data-part="muted-text"
                >
                  **** {method.last4}
                </Text>
                <Text
                  className="ds-billing__muted-text"
                  data-part="muted-text"
                  style={{ fontSize: 12 }}
                >
                  Exp {method.expiry}
                </Text>
                {method.isDefault && (
                  <Tag variant="primary">Default</Tag>
                )}
              </Flex>
            </Flex>
          ))}
        </Stack>
      </Card.Body>
    </Card>
  );
}

export function BillingSurface({
  config,
  loading = false,
}: BillingSurfaceProps): React.ReactElement {
  const useTabs = config.visual.layout === 'tabs';

  // Tab layout groups plan+usage together (they are conceptually one unit),
  // while invoices and payment methods become separate tabs. Empty sections
  // are excluded from the tab bar entirely to avoid confusing empty tabs.
  const content = useTabs ? (
    <Tabs
      className="ds-surface ds-billing ds-billing--tabs"
      items={[
        {
          key: 'plan',
          label: 'Plan',
          children: (
            <Stack spacing="lg">
              <PlanSection config={config} />
              <UsageSection config={config} />
            </Stack>
          ),
        },
        ...(config.behavior.invoices && config.behavior.invoices.length > 0
          ? [{
              key: 'invoices',
              label: 'Invoices',
              children: <InvoicesSection config={config} />,
            }]
          : []),
        ...(config.behavior.paymentMethods && config.behavior.paymentMethods.length > 0
          ? [{
              key: 'payment',
              label: 'Payment Methods',
              children: <PaymentMethodsSection config={config} />,
            }]
          : []),
      ]}
    />
  ) : (
    <Stack
      className="ds-surface ds-billing ds-billing--sections"
      data-part="root"
      data-loading={loading ? 'true' : 'false'}
      spacing="lg"
    >
      <PlanSection config={config} />
      <UsageSection config={config} />
      <InvoicesSection config={config} />
      <PaymentMethodsSection config={config} />
    </Stack>
  );

  return (
    <PageShellSurface chrome={config.presentation.chrome} loading={loading}>
      {content}
    </PageShellSurface>
  );
}
