'use client';

import { use } from 'react';
import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge, DesignSystemProvider } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';
import { ChevronLeftIcon } from '@rottay/design-system/icons';

interface DemoItem {
  title: string;
  description: string;
  components: string[];
}

const PLATFORM_DEMOS: Record<string, { label: string; demos: DemoItem[] }> = {
  identity: {
    label: 'Identity',
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
  const tokens = useTokens();
  const data = PLATFORM_DEMOS[category];

  if (!data) {
    return (
      <Stack spacing="md">
        <Link href="/verticals/platform" style={{ textDecoration: 'none' }}>
          <Flex align="center" gap={4}>
            <ChevronLeftIcon size={16} />
            <Text size="sm" color="primary">Back to Platform</Text>
          </Flex>
        </Link>
        <Text as={"h1" as any} size="2xl" weight="bold">
          Category not found
        </Text>
        <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
          The category &quot;{category}&quot; does not exist in the Platform vertical.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack spacing="lg">
      {/* Back link + header */}
      <Box>
        <Link href="/verticals/platform" style={{ textDecoration: 'none' }}>
          <Flex align="center" gap={4} style={{ marginBottom: tokens.spacing[3] }}>
            <ChevronLeftIcon size={16} />
            <Text size="sm" color="primary">Back to Platform</Text>
          </Flex>
        </Link>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            {data.label}
          </Text>
          <Badge variant="primary">{data.demos.length} demos</Badge>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Platform {data.label.toLowerCase()} demos rendered with the
            classic engine and rottay theme.
          </Text>
        </Box>
      </Box>

      {/* Demo cards */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: tokens.spacing[5],
        }}
      >
        {data.demos.map((demo) => (
          <Card
            key={demo.title}
            style={{ height: '100%' }}
          >
            <Stack spacing="md">
              <Box>
                <Text as={"h3" as any} size="lg" weight="semibold">
                  {demo.title}
                </Text>
                <Box style={{ marginTop: tokens.spacing[1] }}>
                  <Text
                    size="sm"
                    style={{ color: 'var(--ds-color-text-secondary)' }}
                  >
                    {demo.description}
                  </Text>
                </Box>
              </Box>

              {/* Placeholder preview */}
              <Box
                style={{
                  height: 120,
                  borderRadius: tokens.borderRadius.md,
                  background: 'var(--ds-color-neutral-50)',
                  border: '1px dashed var(--ds-color-neutral-300)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  size="xs"
                  style={{ color: 'var(--ds-color-text-muted)' }}
                >
                  Demo preview placeholder
                </Text>
              </Box>

              {/* Component tags */}
              <Flex gap={4} style={{ flexWrap: 'wrap' }}>
                {demo.components.map((name) => (
                  <Box
                    key={name}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: 'var(--ds-color-neutral-100)',
                      fontSize: '0.75rem',
                      color: 'var(--ds-color-text-secondary)',
                      fontFamily: 'var(--font-geist-mono)',
                    }}
                  >
                    {name}
                  </Box>
                ))}
              </Flex>
            </Stack>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}

export default function PlatformCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);

  return (
    <DesignSystemProvider tenantSlug="rottay" forceEngine="classic">
      <PlatformCategoryContent category={category} />
    </DesignSystemProvider>
  );
}
