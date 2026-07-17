'use client';

import { useState } from 'react';
import { useShowroomRuntime } from '@/composition/components/showroom-context';
import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Input,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  useTokens,
} from '@rottay/design-system';
import {
  Building2Icon,
  SettingsIcon,
  ShieldIcon,
  SparklesIcon,
} from '@rottay/design-system/icons';

const SURFACE = 'var(--showroom-shell-surface, var(--ds-color-bg-container, #131316))';
const ELEVATED_SURFACE =
  'var(--showroom-shell-surface-subtle, var(--ds-color-bg-elevated, #17171b))';
const BORDER = 'var(--showroom-shell-border, var(--ds-color-border, rgba(148, 163, 184, 0.22)))';
const TEXT_SECONDARY =
  'var(--showroom-shell-text-secondary, var(--ds-color-text-secondary, #a0a0a5))';
const TEXT_MUTED =
  'var(--showroom-shell-text-tertiary, var(--ds-color-text-muted, #8a8a94))';
const CARD_SHADOW = 'var(--showroom-shell-shadow, 0 18px 40px rgba(0, 0, 0, 0.24))';
const PANEL_SHADOW = '0 12px 28px rgba(0, 0, 0, 0.18)';
const PRIORITY_BACKGROUND = `linear-gradient(180deg, rgba(59, 130, 246, 0.16), rgba(14, 165, 233, 0.08) 58%, ${SURFACE} 100%)`;
const RISK_BACKGROUND = `linear-gradient(180deg, rgba(248, 113, 113, 0.14), rgba(245, 158, 11, 0.08) 58%, ${SURFACE} 100%)`;
const ANALYSIS_BACKGROUND = `linear-gradient(180deg, rgba(99, 102, 241, 0.12), rgba(59, 130, 246, 0.05) 58%, ${SURFACE} 100%)`;

const TENANT_OPTIONS = [
  { value: 'enterprise', label: 'Enterprise workspace' },
  { value: 'growth', label: 'Growth workspace' },
  { value: 'partner', label: 'Partner sandbox' },
];

const REGION_OPTIONS = [
  { value: 'us-east-1', label: 'US East' },
  { value: 'eu-west-1', label: 'EU West' },
  { value: 'sa-east-1', label: 'South America' },
];

const APPROVAL_LADDER = [
  ['Design tokens inherit tenant runtime', 'Ready'],
  ['Security policy aligned with launch tier', 'In review'],
  ['Operational runbook attached', 'Ready'],
] as const;

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <Box style={{ minWidth: 0 }}>
      <Text
        size="xs"
        weight="semibold"
        style={{
          color: TEXT_MUTED,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {eyebrow}
      </Text>
      <Text as={"h3" as any} size="lg" weight="semibold" style={{ marginTop: 8 }}>
        {title}
      </Text>
      <Text size="sm" style={{ marginTop: 6, color: TEXT_SECONDARY, lineHeight: 1.65 }}>
        {description}
      </Text>
    </Box>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  detail: string;
  tone?: 'neutral' | 'priority' | 'risk';
}) {
  const background =
    tone === 'risk'
      ? RISK_BACKGROUND
      : tone === 'priority'
        ? PRIORITY_BACKGROUND
        : ANALYSIS_BACKGROUND;
  const borderColor =
    tone === 'risk'
      ? 'rgba(248, 113, 113, 0.24)'
      : tone === 'priority'
        ? 'rgba(59, 130, 246, 0.24)'
        : BORDER;

  return (
    <Box
      style={{
        minWidth: 0,
        padding: '16px 18px',
        borderRadius: 'var(--ds-border-radius-lg, 16px)',
        border: `1px solid ${borderColor}`,
        background,
        boxShadow: PANEL_SHADOW,
      }}
    >
      <Text
        size="xs"
        weight="semibold"
        style={{
          color: TEXT_MUTED,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </Text>
      <Text size="lg" weight="bold" style={{ marginTop: 10, lineHeight: 1.15 }}>
        {value}
      </Text>
      <Text size="xs" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
        {detail}
      </Text>
    </Box>
  );
}

export default function PlatformTenantFormDemo() {
  const runtime = useShowroomRuntime();
  const tokens = useTokens();
  const [enforceSso, setEnforceSso] = useState(true);
  const [allowBrandOverrides, setAllowBrandOverrides] = useState(false);
  const [launchChecklist, setLaunchChecklist] = useState({
    billing: true,
    dns: true,
    audit: false,
  });

  return (
    <Stack spacing="lg">
      <Card
        style={{
          padding: tokens.spacing[4],
          border: `1px solid ${BORDER}`,
          background: PRIORITY_BACKGROUND,
          boxShadow: CARD_SHADOW,
        }}
      >
        <Stack spacing="md">
          <Flex align="start" justify="between" style={{ gap: 12, flexWrap: 'wrap' }}>
            <Box style={{ minWidth: 0, flex: '1 1 320px' }}>
              <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
                <Badge variant="primary">Tenant launch</Badge>
                <Badge variant="secondary">{runtime.tenantName}</Badge>
              </Flex>
              <Text as={"h2" as any} size="xl" weight="bold" style={{ marginTop: 12 }}>
                Governance-safe tenant configuration
              </Text>
              <Text size="sm" style={{ marginTop: 6, color: TEXT_SECONDARY }}>
                This form exists to prove the showroom is using the design system runtime, not a
                static mock. Security gates, brand controls, and release posture should all restyle
                with the active engine and tenant without breaking hierarchy.
              </Text>
            </Box>

            <Box
              style={{
                minWidth: 240,
                padding: '14px 16px',
                borderRadius: tokens.borderRadius.xl,
                border: `1px solid ${BORDER}`,
                background: ELEVATED_SURFACE,
                boxShadow: PANEL_SHADOW,
              }}
            >
              <Text size="xs" weight="semibold" style={{ color: TEXT_MUTED }}>
                Launch posture
              </Text>
              <Text size="sm" weight="semibold" style={{ marginTop: 8 }}>
                Requires audit trail + SSO
              </Text>
              <Text size="xs" style={{ marginTop: 6, color: TEXT_SECONDARY, lineHeight: 1.6 }}>
                The panel should feel strict and production-grade, not decorative.
              </Text>
            </Box>
          </Flex>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: tokens.spacing[3],
            }}
          >
            <SummaryCard
              label="Launch owner"
              value="Platform Ops"
              detail="Security and rollout sign-off happen in the same operating lane."
              tone="priority"
            />
            <SummaryCard
              label="Policy set"
              value="Enterprise strict"
              detail="SSO, audit export, and role review are required before publish."
            />
            <SummaryCard
              label="Blocking issues"
              value="1 review gate"
              detail="Audit destination approval is the only unresolved blocker."
              tone="risk"
            />
          </Box>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: tokens.spacing[4],
              alignItems: 'start',
            }}
          >
            <Card
              style={{
                padding: tokens.spacing[4],
                border: `1px solid ${BORDER}`,
                background: ANALYSIS_BACKGROUND,
                boxShadow: PANEL_SHADOW,
              }}
            >
              <Stack spacing="md">
                <SectionHeader
                  eyebrow="Tenant identity"
                  title="Core workspace definition"
                  description="This is the operator form layer. It should stay highly structured and low-drama while still reflecting the active runtime."
                />

                <Box>
                  <Text size="xs" weight="semibold" style={{ color: TEXT_MUTED }}>
                    Tenant name
                  </Text>
                  <Input
                    defaultValue="Northstar Health"
                    placeholder="Tenant name"
                    style={{ marginTop: 8 }}
                  />
                </Box>

                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: tokens.spacing[3],
                  }}
                >
                  <Box>
                    <Text size="xs" weight="semibold" style={{ color: TEXT_MUTED }}>
                      Workspace tier
                    </Text>
                    <Select
                      defaultValue={TENANT_OPTIONS[0].value}
                      options={TENANT_OPTIONS}
                      style={{ marginTop: 8 }}
                    />
                  </Box>

                  <Box>
                    <Text size="xs" weight="semibold" style={{ color: TEXT_MUTED }}>
                      Primary region
                    </Text>
                    <Select
                      defaultValue={REGION_OPTIONS[0].value}
                      options={REGION_OPTIONS}
                      style={{ marginTop: 8 }}
                    />
                  </Box>
                </Box>

                <Box>
                  <Text size="xs" weight="semibold" style={{ color: TEXT_MUTED }}>
                    Runtime notes
                  </Text>
                  <Textarea
                    rows={5}
                    style={{ marginTop: 8 }}
                    defaultValue="Enterprise migration with SAML enforcement from day one, billing handoff in week two, and delegated admin access for the HRIS team."
                  />
                </Box>

                <Box
                  style={{
                    paddingTop: tokens.spacing[4],
                    borderTop: `1px solid ${BORDER}`,
                  }}
                >
                  <SectionHeader
                    eyebrow="Policy controls"
                    title="Guardrails before publish"
                    description="Security and brand settings belong to a stricter section so the operator immediately understands which controls are gating launch."
                  />
                </Box>

                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: tokens.spacing[3],
                  }}
                >
                  <Card
                    style={{
                      padding: tokens.spacing[3],
                      border: '1px solid rgba(248, 113, 113, 0.2)',
                      background: SURFACE,
                      boxShadow: PANEL_SHADOW,
                    }}
                  >
                    <Flex align="center" gap={10}>
                      <ShieldIcon size={18} />
                      <Box>
                        <Text size="sm" weight="semibold">
                          Security guardrails
                        </Text>
                        <Text size="xs" style={{ marginTop: 4, color: TEXT_SECONDARY }}>
                          Authentication, auditability, and admin trust.
                        </Text>
                      </Box>
                    </Flex>

                    <Stack spacing="sm" style={{ marginTop: tokens.spacing[3] }}>
                      <Flex align="center" justify="between" gap={12}>
                        <Box>
                          <Text size="sm" weight="medium">
                            Enforce SSO at launch
                          </Text>
                          <Text size="xs" style={{ color: TEXT_MUTED }}>
                            Blocks password-only access after onboarding.
                          </Text>
                        </Box>
                        <Switch checked={enforceSso} onChange={setEnforceSso} />
                      </Flex>

                      <Checkbox
                        checked={launchChecklist.billing}
                        onChange={(checked) =>
                          setLaunchChecklist((current) => ({ ...current, billing: Boolean(checked) }))
                        }
                        label="Billing owner assigned"
                      />
                      <Checkbox
                        checked={launchChecklist.dns}
                        onChange={(checked) =>
                          setLaunchChecklist((current) => ({ ...current, dns: Boolean(checked) }))
                        }
                        label="Custom domain configured"
                      />
                      <Checkbox
                        checked={launchChecklist.audit}
                        onChange={(checked) =>
                          setLaunchChecklist((current) => ({ ...current, audit: Boolean(checked) }))
                        }
                        label="Audit export destination approved"
                      />
                    </Stack>
                  </Card>

                  <Card
                    style={{
                      padding: tokens.spacing[3],
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      background: SURFACE,
                      boxShadow: PANEL_SHADOW,
                    }}
                  >
                    <Flex align="center" gap={10}>
                      <SettingsIcon size={18} />
                      <Box>
                        <Text size="sm" weight="semibold">
                          Brand governance
                        </Text>
                        <Text size="xs" style={{ marginTop: 4, color: TEXT_SECONDARY }}>
                          Tenant overrides should still inherit DS rules.
                        </Text>
                      </Box>
                    </Flex>

                    <Stack spacing="sm" style={{ marginTop: tokens.spacing[3] }}>
                      <Flex align="center" justify="between" gap={12}>
                        <Box>
                          <Text size="sm" weight="medium">
                            Allow local brand overrides
                          </Text>
                          <Text size="xs" style={{ color: TEXT_MUTED }}>
                            Lets the tenant diverge without forking structure.
                          </Text>
                        </Box>
                        <Switch
                          checked={allowBrandOverrides}
                          onChange={setAllowBrandOverrides}
                        />
                      </Flex>

                      <Box>
                        <Text size="xs" weight="semibold" style={{ color: TEXT_MUTED }}>
                          Primary domain
                        </Text>
                        <Input defaultValue="admin.northstarhealth.com" style={{ marginTop: 8 }} />
                      </Box>

                      <Box>
                        <Text size="xs" weight="semibold" style={{ color: TEXT_MUTED }}>
                          Support contact
                        </Text>
                        <Input defaultValue="ops@northstarhealth.com" style={{ marginTop: 8 }} />
                      </Box>
                    </Stack>
                  </Card>
                </Box>

                <Flex
                  justify="between"
                  align="center"
                  style={{
                    gap: 12,
                    flexWrap: 'wrap',
                    paddingTop: tokens.spacing[4],
                    borderTop: `1px solid ${BORDER}`,
                  }}
                >
                  <Text size="xs" style={{ color: TEXT_MUTED }}>
                    Last reviewed by Platform Ops · 18 minutes ago
                  </Text>
                  <Flex gap={10} style={{ flexWrap: 'wrap' }}>
                    <Button variant="ghost">Save draft</Button>
                    <Button>Publish tenant config</Button>
                  </Flex>
                </Flex>
              </Stack>
            </Card>

            <Stack spacing="md">
              <Card
                style={{
                  padding: tokens.spacing[4],
                  border: '1px solid rgba(248, 113, 113, 0.2)',
                  background: RISK_BACKGROUND,
                  boxShadow: PANEL_SHADOW,
                }}
              >
                <Flex align="center" gap={10}>
                  <SparklesIcon size={18} />
                  <Box>
                    <Text size="sm" weight="semibold">
                      Approval ladder
                    </Text>
                    <Text size="xs" style={{ marginTop: 4, color: TEXT_SECONDARY }}>
                      This rail owns readiness, not the form body.
                    </Text>
                  </Box>
                </Flex>

                <Stack spacing="sm" style={{ marginTop: tokens.spacing[3] }}>
                  {APPROVAL_LADDER.map(([label, status]) => (
                    <Flex
                      key={label}
                      align="center"
                      justify="between"
                      style={{
                        gap: 12,
                        padding: '10px 12px',
                        borderRadius: tokens.borderRadius.lg,
                        border: `1px solid ${BORDER}`,
                        background: SURFACE,
                        boxShadow: PANEL_SHADOW,
                      }}
                    >
                      <Text size="sm" style={{ minWidth: 0 }}>
                        {label}
                      </Text>
                      <Badge variant={status === 'In review' ? 'warning' : 'success'}>{status}</Badge>
                    </Flex>
                  ))}
                </Stack>
              </Card>

              <Card
                style={{
                  padding: tokens.spacing[4],
                  border: `1px solid ${BORDER}`,
                  background: ANALYSIS_BACKGROUND,
                  boxShadow: PANEL_SHADOW,
                }}
              >
                <Flex align="center" gap={10}>
                  <Building2Icon size={18} />
                  <Box>
                    <Text size="sm" weight="semibold">
                      Runtime framing
                    </Text>
                    <Text size="xs" style={{ marginTop: 4, color: TEXT_SECONDARY }}>
                      {runtime.tenantName} · {runtime.engine} · {runtime.productProfileLabel}
                    </Text>
                  </Box>
                </Flex>

                <Text
                  size="sm"
                  style={{
                    marginTop: tokens.spacing[3],
                    color: TEXT_SECONDARY,
                    lineHeight: 1.7,
                  }}
                >
                  This panel explains the runtime contract: structure stays stable, while density,
                  accent posture, and border rhythm visibly respond to the active engine and tenant
                  without making governance work feel less serious.
                </Text>
              </Card>
            </Stack>
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}
