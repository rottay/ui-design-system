'use client';

import { use } from 'react';
import { ShowroomLink as Link } from '@/components/showroom-link';
import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { ChevronLeftIcon } from '@rottay/design-system/icons';
import {
  VerticalCategoryAppendix,
  type VerticalDemoItem,
} from '../../vertical-category-appendix';

interface CategoryData {
  label: string;
  summary: string;
  operators: string[];
  tempo: string;
  principles: string[];
  demos: VerticalDemoItem[];
}

const PLATFORM_DEMOS: Record<string, CategoryData> = {
  identity: {
    label: 'Identity',
    summary:
      'Platform identity surfaces are about trust at scale: fast lookup, stable user context, and clear control over sessions and profile state.',
    operators: ['Admins', 'Support', 'Security teams'],
    tempo: 'High-frequency operational review',
    principles: [
      'Keep user state obvious.',
      'Make account actions reversible when possible.',
      'Surface role and session context early.',
    ],
    demos: [
      {
        title: 'User List',
        description: 'Paginated user table with search, filters, bulk actions, and role badges.',
        components: ['PatternDataTable', 'CollectionHeader', 'TableToolbar', 'Badge', 'Avatar'],
      },
      {
        title: 'User Detail',
        description: 'User profile view with activity timeline, session list, and edit form.',
        components: ['RecordFieldGrid', 'DetailHeader', 'Tabs', 'Timeline', 'Form'],
      },
      {
        title: 'Profile Settings',
        description: 'Self-service profile editor with avatar upload and MFA configuration.',
        components: ['FormBuilder', 'FormHeader', 'Upload', 'Switch', 'Input'],
      },
      {
        title: 'Session Manager',
        description: 'Active session list with device info, location, and revoke actions.',
        components: ['PatternDataTable', 'Badge', 'Button', 'Modal', 'Text'],
      },
    ],
  },
  tenancy: {
    label: 'Tenancy',
    summary:
      'Tenancy views carry the white-label promise of the platform: each customer has branding, billing, domains, and lifecycle state that operators must govern safely.',
    operators: ['Platform ops', 'Customer success', 'Billing admins'],
    tempo: 'Periodic configuration plus exception handling',
    principles: [
      'Show tenant identity before controls.',
      'Separate billing from brand setup.',
      'Make environment state auditable.',
    ],
    demos: [
      {
        title: 'Tenant List',
        description: 'Multi-tenant directory with plan badges, usage stats, and quick actions.',
        components: ['PatternDataTable', 'CollectionHeader', 'Badge', 'Statistic', 'Dropdown'],
      },
      {
        title: 'Tenant Settings',
        description: 'Company profile editor with branding, billing, and domain configuration.',
        components: ['FormBuilder', 'Tabs', 'Upload', 'ColorPicker', 'Input'],
      },
      {
        title: 'Tenant Dashboard',
        description: 'Usage metrics, subscription status, and resource consumption overview.',
        components: ['StatsHeader', 'BarChart', 'Card', 'Progress', 'Statistic'],
      },
    ],
  },
  permissions: {
    label: 'Permissions',
    summary:
      'Permissions are the governance heart of the platform, where safety, discoverability, and policy confidence need to coexist.',
    operators: ['Security', 'Admins', 'Compliance owners'],
    tempo: 'Low-frequency but high-risk configuration',
    principles: [
      'Show blast radius before save.',
      'Group resources into mental models, not raw IDs.',
      'Make inherited state visible.',
    ],
    demos: [
      {
        title: 'Role Manager',
        description: 'Role list with permission counts, user assignments, and hierarchy view.',
        components: ['PatternDataTable', 'CollectionHeader', 'Tree', 'Badge', 'Tag'],
      },
      {
        title: 'Permission Matrix',
        description: 'Grid view of resource-action permissions with toggle controls.',
        components: ['Table', 'Checkbox', 'Tag', 'Tooltip', 'Text'],
      },
      {
        title: 'Policy Editor',
        description: 'Policy rule builder with conditions, actions, and effect preview.',
        components: ['FormBuilder', 'Select', 'Input', 'Button', 'Card'],
      },
    ],
  },
  auth: {
    label: 'Auth',
    summary:
      'Auth surfaces set the tone for platform credibility. They need to feel secure, legible, and unforgiving about ambiguity while still remaining humane.',
    operators: ['End users', 'Security admins', 'Integrations teams'],
    tempo: 'Entry-point and exception-driven',
    principles: [
      'Keep trust signals visible.',
      'Favor step clarity over visual novelty.',
      'Separate credential management from identity profile tasks.',
    ],
    demos: [
      {
        title: 'Login Flow',
        description: 'Email/password login with social providers and remember-me toggle.',
        components: ['Form', 'Input', 'Button', 'Checkbox', 'Divider'],
      },
      {
        title: 'MFA Setup',
        description: 'TOTP setup wizard with QR code, backup codes, and verification step.',
        components: ['Steps', 'QRCode', 'OTPInput', 'Button', 'Alert'],
      },
      {
        title: 'Password Reset',
        description: 'Password reset request and confirmation with strength indicator.',
        components: ['Form', 'Input', 'Progress', 'Button', 'Result'],
      },
      {
        title: 'API Key Admin',
        description: 'API key generation, rotation, and scope management for integrations.',
        components: ['PatternDataTable', 'Modal', 'Input', 'Tag', 'Button'],
      },
    ],
  },
  features: {
    label: 'Features',
    summary:
      'Feature tooling turns rollout control into a first-class product capability. These views balance experimentation with governance.',
    operators: ['Product ops', 'Release managers', 'Experiment owners'],
    tempo: 'Planned operational steering',
    principles: [
      'Rollout state should be glanceable.',
      'Treat experiments and flags as distinct decisions.',
      'Prioritize safe defaults and reversal.',
    ],
    demos: [
      {
        title: 'Flag Dashboard',
        description: 'Feature flag overview with status, rollout percentage, and toggle controls.',
        components: ['PatternDataTable', 'Switch', 'Badge', 'Progress', 'Tooltip'],
      },
      {
        title: 'Rollout Strategy',
        description: 'Gradual rollout editor with targeting rules and percentage slider.',
        components: ['FormBuilder', 'Slider', 'Select', 'Tag', 'Card'],
      },
      {
        title: 'Experiment Tracker',
        description: 'A/B test results with variant comparison and statistical significance.',
        components: ['Table', 'BarChart', 'Badge', 'Statistic', 'Tabs'],
      },
    ],
  },
  navigation: {
    label: 'Navigation',
    summary:
      'Platform navigation is a productivity feature. It needs to help operators jump between deep modules without losing orientation.',
    operators: ['Admins', 'Support', 'Power users'],
    tempo: 'Continuous throughout every workflow',
    principles: [
      'Keep hierarchy stable.',
      'Expose shortcuts for expert users.',
      'Preserve context during movement.',
    ],
    demos: [
      {
        title: 'Admin Sidebar',
        description: 'Collapsible sidebar with nested menu groups, icons, and active indicators.',
        components: ['Menu', 'Collapse', 'Badge', 'Avatar', 'Tooltip'],
      },
      {
        title: 'Command Palette',
        description: 'Keyboard-triggered command search with categorized results and shortcuts.',
        components: ['Modal', 'Input', 'List', 'Kbd', 'Text'],
      },
      {
        title: 'Breadcrumb System',
        description: 'Dynamic breadcrumbs with entity resolution and overflow dropdown.',
        components: ['Breadcrumb', 'Dropdown', 'Text', 'Tooltip', 'Link'],
      },
    ],
  },
  notifications: {
    label: 'Notifications',
    summary:
      'Notification patterns keep operators informed without flooding them. The platform uses them to surface change, urgency, and follow-up state.',
    operators: ['Admins', 'Support', 'End users'],
    tempo: 'Interrupt-driven and contextual',
    principles: [
      'Match channel to urgency.',
      'Keep escalation state concise.',
      'Allow quick return to source context.',
    ],
    demos: [
      {
        title: 'Notification Center',
        description: 'Bell icon drawer with unread count, categories, and mark-all-read action.',
        components: ['Drawer', 'Badge', 'List', 'Button', 'Text'],
      },
      {
        title: 'Toast System',
        description: 'Stacking toast notifications with auto-dismiss, actions, and variants.',
        components: ['Toast', 'Button', 'Alert', 'Text', 'Progress'],
      },
      {
        title: 'Email Templates',
        description: 'Template preview with variable substitution and send-test action.',
        components: ['Card', 'Input', 'Button', 'Tabs', 'Text'],
      },
    ],
  },
};

function PlatformCategoryContent({ category }: { category: string }) {
  const data = PLATFORM_DEMOS[category];

  if (!data) {
    return (
      <Stack spacing="lg" fullWidth>
        <Link href="/verticals/platform" style={{ textDecoration: 'none' }}>
          <Flex align="center" gap={4}>
            <ChevronLeftIcon size={16} />
            <Text size="sm" color="primary">Back to Platform</Text>
          </Flex>
        </Link>
        <Card
          style={{
            padding: 'var(--ds-spacing-5, 20px)',
            border: '1px solid var(--ds-color-border, rgba(148, 163, 184, 0.28))',
            background:
              'linear-gradient(180deg, rgba(59, 130, 246, 0.08), transparent 36%), var(--ds-color-bg-container, #ffffff)',
          }}
        >
          <Stack spacing="md">
            <Badge variant="secondary">Unknown category</Badge>
            <Box>
              <Text
                as={"h1" as any}
                size="2xl"
                weight="bold"
                style={{ display: 'block' }}
              >
                Category not found
              </Text>
              <Text
                size="md"
                style={{
                  display: 'block',
                  marginTop: 8,
                  color: 'var(--ds-color-text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                The category &quot;{category}&quot; does not exist in the Platform vertical.
              </Text>
            </Box>
            <Box
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--ds-border-radius-lg, 16px)',
                background: 'var(--ds-color-bg-secondary, #f1f5f9)',
                border: '1px solid var(--ds-color-border, rgba(148, 163, 184, 0.28))',
              }}
            >
              <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.5 }}>
                Open the parent vertical to pick a supported governance lane and inspect the live showcase from there.
              </Text>
            </Box>
          </Stack>
        </Card>
      </Stack>
    );
  }

  return (
    <VerticalCategoryAppendix
      backHref="/verticals/platform"
      backLabel="Back to Platform"
      label={data.label}
      headline={`${data.label} in Platform is about controlled clarity, not ornamental UI.`}
      summary={`${data.summary} The workflow stays Platform-specific, but the live rendering should still come from the active docs runtime rather than a local preset.`}
      operators={data.operators}
      tempo={data.tempo}
      principles={data.principles}
      demos={data.demos}
    />
  );
}

export default function PlatformCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);

  return <PlatformCategoryContent category={category} />;
}
