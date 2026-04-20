'use client';

import { useState } from 'react';
import {
  Box,
  Flex,
  Stack,
  Text,
  Card,
  Input,
  Select,
  Switch,
  Button,
  Badge,
  DesignSystemProvider,
} from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';

const PLAN_OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
];

function TenantFormContent() {
  const tokens = useTokens();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [plan, setPlan] = useState<string | number>('pro');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [logoUrl, setLogoUrl] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState(false);

  return (
    <Stack spacing="lg">
      <Box>
        <Text as={"h2" as any} size="xl" weight="bold">
          Create Tenant
        </Text>
        <Box style={{ marginTop: tokens.spacing[1] }}>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Register a new tenant organization on the platform
          </Text>
        </Box>
      </Box>

      <Stack spacing="md">
        {/* Basic Information */}
        <Card style={{ padding: tokens.spacing[5] }}>
          <Stack spacing="md">
            <Flex align="center" gap={8}>
              <Text as={"h3" as any} size="lg" weight="semibold">
                Basic Information
              </Text>
              <Badge variant="primary">Required</Badge>
            </Flex>

            <Stack spacing="sm">
              <Box>
                <Text size="sm" weight="medium" style={{ marginBottom: tokens.spacing[1] }}>
                  Organization Name
                </Text>
                <Input
                  value={name}
                  onChange={(value: string) => setName(value)}
                  placeholder="Acme Corporation"
                  size="md"
                />
              </Box>

              <Box>
                <Text size="sm" weight="medium" style={{ marginBottom: tokens.spacing[1] }}>
                  Slug
                </Text>
                <Input
                  value={slug}
                  onChange={(value: string) => setSlug(value)}
                  placeholder="acme-corp"
                  size="md"
                />
                <Text size="xs" style={{ color: 'var(--ds-color-text-muted)', marginTop: 4 }}>
                  URL-friendly identifier. Used in tenant routing.
                </Text>
              </Box>

              <Box>
                <Text size="sm" weight="medium" style={{ marginBottom: tokens.spacing[1] }}>
                  Plan
                </Text>
                <Select
                  value={plan}
                  onChange={(value) => setPlan(value as string)}
                  options={PLAN_OPTIONS}
                  placeholder="Select a plan"
                  size="md"
                />
              </Box>
            </Stack>
          </Stack>
        </Card>

        {/* Branding */}
        <Card style={{ padding: tokens.spacing[5] }}>
          <Stack spacing="md">
            <Text as={"h3" as any} size="lg" weight="semibold">
              Branding
            </Text>

            <Stack spacing="sm">
              <Box>
                <Text size="sm" weight="medium" style={{ marginBottom: tokens.spacing[1] }}>
                  Primary Color
                </Text>
                <Flex align="center" gap={8}>
                  <Input
                    value={primaryColor}
                    onChange={(value: string) => setPrimaryColor(value)}
                    placeholder="#6366f1"
                    size="md"
                    style={{ flex: 1 }}
                  />
                  <Box
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: primaryColor,
                      border: '1px solid var(--ds-color-border)',
                      flexShrink: 0,
                    }}
                  />
                </Flex>
              </Box>

              <Box>
                <Text size="sm" weight="medium" style={{ marginBottom: tokens.spacing[1] }}>
                  Logo URL
                </Text>
                <Input
                  value={logoUrl}
                  onChange={(value: string) => setLogoUrl(value)}
                  placeholder="https://cdn.example.com/logo.svg"
                  size="md"
                />
              </Box>
            </Stack>
          </Stack>
        </Card>

        {/* Security */}
        <Card style={{ padding: tokens.spacing[5] }}>
          <Stack spacing="md">
            <Text as={"h3" as any} size="lg" weight="semibold">
              Security
            </Text>

            <Flex align="center" justify="between">
              <Box>
                <Text size="sm" weight="medium">
                  Require MFA
                </Text>
                <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
                  Enforce multi-factor authentication for all users
                </Text>
              </Box>
              <Switch
                checked={mfaEnabled}
                onChange={(checked: boolean) => setMfaEnabled(checked)}
              />
            </Flex>
          </Stack>
        </Card>

        {/* Submit */}
        <Flex justify="end" gap={12}>
          <Button variant="default" size="md">
            Cancel
          </Button>
          <Button variant="primary" size="md">
            Create Tenant
          </Button>
        </Flex>
      </Stack>
    </Stack>
  );
}

export default function PlatformTenantFormDemo() {
  return (
    <DesignSystemProvider tenantSlug="rottay" forceEngine="classic">
      <TenantFormContent />
    </DesignSystemProvider>
  );
}
