'use client';

import type { ReactNode } from 'react';
import {
  AuthSurface,
  ChatSurface,
  EditorSurface,
  EmptyStateSurface,
  MarketingSurface,
  MediaSurface,
  NotificationSurface,
  OnboardingSurface,
  PricingSurface,
  createAuthSurfaceConfig,
  createMarketingSurfaceConfig,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Stack,
  Text,
} from '@rottay/design-system';
import { createThumbnail, noop } from './surfaces-preview-shared';

export const EXPERIENCE_SURFACE_PREVIEWS: Record<string, ReactNode> = {
  auth: (
    <Box style={{ width: '100%' }}>
      <AuthSurface
        config={createAuthSurfaceConfig({
          visual: { layout: 'split', heroPosition: 'start', maxWidth: 1080 },
          presentation: {
            eyebrow: 'Secure access',
            title: 'Sign in to your workspace',
            subtitle: 'Continue where you left off across your projects.',
            form: (
              <Stack spacing="md">
                <Box style={{ padding: 12, border: '1px solid var(--ds-color-border)', borderRadius: 10 }}>
                  <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>Email address</Text>
                </Box>
                <Box style={{ padding: 12, border: '1px solid var(--ds-color-border)', borderRadius: 10 }}>
                  <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>Password</Text>
                </Box>
                <Button variant="primary">Continue</Button>
              </Stack>
            ),
            hero: (
              <Stack spacing="sm">
                <Text style={{ fontSize: 22, fontWeight: 700 }}>One workspace for every project</Text>
                <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
                  Records, documents, and reports stay in sync for your whole account.
                </Text>
              </Stack>
            ),
            topBar: <Text size="sm" weight="semibold">Rottay</Text>,
            footer: <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>New here? Create an account</Text>,
            legal: <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>Terms of Service and Privacy Policy</Text>,
          },
          behavior: { actions: [{ id: 'sso', label: 'Continue with SSO', onClick: noop }] },
        })}
      />
    </Box>
  ),
  chat: (
    <Box style={{ width: '100%' }}>
      <ChatSurface
        config={{
          visual: { composerRows: 3, transcriptHeight: 360 },
          presentation: {
            chrome: { title: 'Assistant', subtitle: 'Ask about your records and reports' },
            composerPlaceholder: 'Send a message',
            headerContent: <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>Assistant is online</Text>,
            sidebar: (
              <Stack spacing="xs">
                <Text size="sm" weight="semibold">Recent threads</Text>
                <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>Weekly summary</Text>
                <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>Draft report review</Text>
              </Stack>
            ),
          },
          behavior: {
            // `role` is the DS AssistantMessageRole API token (unavoidable) — not domain copy.
            messages: [
              {
                id: 'msg-1',
                author: 'You',
                role: 'user',
                align: 'end',
                deliveryStatus: 'sent',
                timestamp: '2 min ago',
                parts: [{ type: 'text', content: 'Summarize this week across my projects.' }],
              },
              {
                id: 'msg-2',
                author: 'Assistant',
                role: 'assistant',
                deliveryStatus: 'streaming',
                timestamp: 'just now',
                parts: [
                  { type: 'text', content: 'Three projects advanced and two reports are ready to publish.', streaming: true },
                  { type: 'tool-status', name: 'scan_records', status: 'complete', summary: 'Checked recent items.', duration: '0.6s' },
                ],
              },
            ],
            assistantTyping: true,
            typingLabel: 'Assistant is typing',
            onSend: noop,
          },
        }}
      />
    </Box>
  ),
  editor: (
    <Box style={{ width: '100%' }}>
      <EditorSurface
        config={{
          visual: { layout: 'split', editorMinHeight: 260 },
          presentation: {
            chrome: { title: 'Compose document', subtitle: 'Draft and publish' },
            description: 'Write the update, then preview before publishing.',
            helperText: 'Markdown is supported.',
            toolbar: (
              <Flex gap={8}>
                <Button size="sm" variant="ghost">Bold</Button>
                <Button size="sm" variant="ghost">Link</Button>
              </Flex>
            ),
            preview: (
              <Stack spacing="xs">
                <Text weight="semibold">Preview</Text>
                <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>Rendered output appears here.</Text>
              </Stack>
            ),
            statusBar: <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>Saved just now</Text>,
          },
          behavior: {
            initialValue: 'Weekly summary\n\nThree projects advanced and two reports are ready.',
            placeholder: 'Start writing...',
            saveAction: { id: 'save', label: 'Save draft', onClick: noop },
            publishAction: { id: 'publish', label: 'Publish', variant: 'primary', onClick: noop },
            cancelAction: { id: 'cancel', label: 'Cancel', variant: 'ghost', onClick: noop },
          },
        }}
      />
    </Box>
  ),
  'empty-state': (
    <Box style={{ width: '100%' }}>
      <EmptyStateSurface
        config={{
          visual: { maxWidth: 720 },
          presentation: {
            chrome: { title: 'Projects' },
            icon: (
              <Box
                style={{
                  width: 56, height: 56, display: 'grid', placeItems: 'center', borderRadius: 16,
                  background: 'color-mix(in srgb, var(--ds-color-primary) 14%, transparent)',
                }}
              >
                <Text style={{ fontSize: 24 }}>+</Text>
              </Box>
            ),
            title: 'No projects yet',
            description: 'Create your first project to start tracking records and reports.',
            content: (
              <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
                You can also import items from an existing workspace.
              </Text>
            ),
          },
          behavior: {
            primaryAction: { id: 'create', label: 'Create project', variant: 'primary', onClick: noop },
            secondaryAction: { id: 'import', label: 'Import items', onClick: noop },
          },
        }}
      />
    </Box>
  ),
  marketing: (
    <Box style={{ width: '100%' }}>
      <MarketingSurface
        config={createMarketingSurfaceConfig({
          visual: { maxWidth: 1180, heroPosition: 'end' },
          presentation: {
            topBar: <Text size="sm" weight="semibold">Rottay</Text>,
            eyebrow: 'Operations platform',
            badge: 'New',
            title: 'One place for every project',
            description: 'Bring records, documents, and reports into a single workspace your whole account can trust.',
            supporting: <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>Trusted by modern teams</Text>,
            hero: (
              <Box style={{ minHeight: 220, borderRadius: 16, background: 'var(--ds-color-bg-secondary)', padding: 20 }}>
                <Text weight="semibold">Product preview</Text>
              </Box>
            ),
            sections: [
              <Card key="s1" variant="outlined"><Card.Body><Text weight="semibold">Unified records</Text></Card.Body></Card>,
              <Card key="s2" variant="outlined"><Card.Body><Text weight="semibold">Live reports</Text></Card.Body></Card>,
            ],
            footer: <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>© Rottay</Text>,
          },
          behavior: {
            actions: [
              { id: 'start', label: 'Get started', variant: 'primary', onClick: noop },
              { id: 'demo', label: 'View demo', onClick: noop },
            ],
          },
        })}
      />
    </Box>
  ),
  media: (
    <Box style={{ width: '100%' }}>
      <MediaSurface
        config={{
          visual: { layout: 'detail', columns: 3, previewHeight: 320 },
          presentation: {
            chrome: { title: 'Media library', subtitle: 'Assets across your projects' },
          },
          behavior: {
            items: [
              { id: 'media-1', type: 'image', title: 'Cover art', description: 'Primary asset',
                src: createThumbnail('Cover', '#1d4ed8'), thumbnailSrc: createThumbnail('Cover', '#1d4ed8') },
              { id: 'media-2', type: 'image', title: 'Diagram', description: 'Reference figure',
                src: createThumbnail('Diagram', '#0f766e'), thumbnailSrc: createThumbnail('Diagram', '#0f766e') },
              { id: 'media-3', type: 'image', title: 'Banner', description: 'Wide layout',
                src: createThumbnail('Banner', '#7c3aed'), thumbnailSrc: createThumbnail('Banner', '#7c3aed') },
            ],
            selectedItemId: 'media-1',
            onSelectItem: noop,
            actions: [{ id: 'upload', label: 'Upload', variant: 'primary', onClick: noop }],
            itemActions: [
              { id: 'download', label: 'Download', onClick: noop },
              { id: 'remove', label: 'Remove', variant: 'danger', onClick: noop },
            ],
          },
        }}
      />
    </Box>
  ),
  notification: (
    <Box style={{ width: '100%' }}>
      <NotificationSurface
        config={{
          visual: { layout: 'tabs' },
          presentation: { chrome: { title: 'Notifications', subtitle: 'Activity across your workspace' } },
          behavior: {
            notifications: [
              { id: 'ntf-1', title: 'Report ready', message: 'Your weekly report is ready to review.',
                timestamp: '2026-04-18T09:00:00Z', read: false, type: 'success',
                action: { label: 'Open report', onClick: noop } },
              { id: 'ntf-2', title: 'Document shared', message: 'A teammate shared a document with you.',
                timestamp: '2026-04-18T08:10:00Z', read: false, type: 'info' },
              { id: 'ntf-3', title: 'Storage almost full', message: 'You are near your plan limit.',
                timestamp: '2026-04-17T16:30:00Z', read: true, type: 'warning' },
            ],
            preferences: [
              { id: 'pref-1', label: 'Product updates', description: 'News and improvements',
                channel: 'email', enabled: true, category: 'General' },
              { id: 'pref-2', label: 'Mentions', description: 'When someone mentions you',
                channel: 'push', enabled: false, category: 'Activity' },
              { id: 'pref-3', label: 'Weekly digest', channel: 'in-app', enabled: true, category: 'Activity' },
            ],
            onMarkRead: noop,
            onMarkAllRead: noop,
            onDelete: noop,
            onPreferenceChange: noop,
          },
        }}
      />
    </Box>
  ),
  onboarding: (
    <Box style={{ width: '100%' }}>
      <OnboardingSurface
        config={{
          visual: { orientation: 'vertical', showProgress: true, heroPosition: 'start', maxWidth: 1080 },
          presentation: {
            chrome: { title: 'Set up your workspace', subtitle: 'A few quick steps' },
            description: 'Complete these steps to finish setting up your account.',
            hero: (
              <Stack spacing="xs">
                <Text weight="semibold">Welcome</Text>
                <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
                  Get your projects and reports ready in minutes.
                </Text>
              </Stack>
            ),
            checklist: (
              <Stack spacing="xs">
                <Text size="sm">Create your account</Text>
                <Text size="sm">Add your first project</Text>
                <Text size="sm">Invite people</Text>
              </Stack>
            ),
          },
          behavior: {
            steps: [
              { key: 'profile', title: 'Your details', description: 'Basic information',
                content: <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>Tell us your name and time zone.</Text> },
              { key: 'workspace', title: 'Create a project', description: 'Name your first project',
                content: <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>Projects group your records and documents.</Text> },
              { key: 'invite', title: 'Invite people', description: 'Optional', optional: true,
                content: <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>Add teammates by email.</Text> },
            ],
            submitAction: { id: 'finish', label: 'Finish setup', variant: 'primary', onClick: noop },
            cancelAction: { id: 'cancel', label: 'Cancel', variant: 'ghost', onClick: noop },
          },
        }}
      />
    </Box>
  ),
  pricing: (
    <Box style={{ width: '100%' }}>
      <PricingSurface
        config={{
          visual: { maxWidth: 1080 },
          presentation: {
            chrome: { title: 'Plans', subtitle: 'Pick the plan that fits' },
            intro: <Text style={{ color: 'var(--ds-color-text-secondary)' }}>All plans include a 14-day trial.</Text>,
            footer: <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>Prices exclude tax.</Text>,
          },
          behavior: {
            plans: [
              { id: 'free', name: 'Free', price: 0, cta: 'Start free',
                features: { projects: '3', storage: '1 GB', reports: false, support: 'Community' } },
              { id: 'pro', name: 'Pro', price: 29, cta: 'Upgrade', popular: true, priceNote: 'per month',
                features: { projects: 'Unlimited', storage: '100 GB', reports: true, support: 'Priority' } },
              { id: 'scale', name: 'Scale', price: 99, cta: 'Contact us', priceNote: 'per month',
                features: { projects: 'Unlimited', storage: '1 TB', reports: true, support: 'Dedicated' } },
            ],
            features: [
              { key: 'projects', label: 'Projects', category: 'Core' },
              { key: 'storage', label: 'Storage', category: 'Core' },
              { key: 'reports', label: 'Advanced reports', category: 'Advanced' },
              { key: 'support', label: 'Support', category: 'Support' },
            ],
            currentPlan: 'free',
            billingCycle: 'monthly',
            currency: 'USD',
            onSelectPlan: noop,
            onBillingCycleChange: noop,
          },
        }}
      />
    </Box>
  ),
};
