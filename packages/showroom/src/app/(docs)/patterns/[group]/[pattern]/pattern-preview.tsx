'use client';

import {
  Box,
  Flex,
  Text,
  Badge,
  Card,
  Button,
  Input,
  Stack,
  Avatar,
} from '@rottay/design-system';

// ---------------------------------------------------------------------------
// Preview map -- keyed by pattern slug from the registry
// ---------------------------------------------------------------------------

const PATTERN_PREVIEWS: Record<string, React.ReactNode> = {
  /* ---- data ---- */
  'data-table': (
    <Box
      style={{
        border: '1px solid var(--ds-color-border)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <Flex
        style={{
          padding: '8px 16px',
          background: 'var(--ds-color-bg-container)',
          borderBottom: '1px solid var(--ds-color-border)',
        }}
      >
        <Text size="xs" weight="semibold" style={{ flex: 1 }}>
          Name
        </Text>
        <Text size="xs" weight="semibold" style={{ flex: 1 }}>
          Email
        </Text>
        <Text size="xs" weight="semibold" style={{ width: 80 }}>
          Status
        </Text>
      </Flex>
      {['Alice Johnson', 'Bob Smith', 'Carol Davis'].map((name, i) => (
        <Flex
          key={name}
          style={{
            padding: '8px 16px',
            borderBottom:
              i < 2 ? '1px solid var(--ds-color-border)' : undefined,
          }}
        >
          <Text size="sm" style={{ flex: 1 }}>
            {name}
          </Text>
          <Text
            size="sm"
            style={{ flex: 1, color: 'var(--ds-color-text-secondary)' }}
          >
            {name.toLowerCase().replace(' ', '.')}@acme.com
          </Text>
          <Box style={{ width: 80 }}>
            <Badge
              variant={i === 0 ? 'success' : 'secondary'}
              size="sm"
            >
              {i === 0 ? 'Active' : 'Inactive'}
            </Badge>
          </Box>
        </Flex>
      ))}
    </Box>
  ),

  'stats-grid': (
    <Flex gap={16} style={{ flexWrap: 'wrap' }}>
      {[
        { label: 'Revenue', value: '$45.2K', change: '+12%' },
        { label: 'Users', value: '1,247', change: '+8%' },
        { label: 'Sessions', value: '8.4K', change: '-3%' },
      ].map((s) => (
        <Card key={s.label} style={{ flex: '1 1 120px', padding: 16 }}>
          <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
            {s.label}
          </Text>
          <Text size="xl" weight="bold">
            {s.value}
          </Text>
          <Text
            size="xs"
            style={{
              color: s.change.startsWith('+')
                ? 'var(--ds-color-success)'
                : 'var(--ds-color-error)',
            }}
          >
            {s.change}
          </Text>
        </Card>
      ))}
    </Flex>
  ),

  /* ---- forms ---- */
  'form-builder': (
    <Card style={{ maxWidth: 400 }}>
      <Stack spacing={16}>
        <Input placeholder="Full name" />
        <Input placeholder="Email address" />
        <Flex gap={8}>
          <Button variant="primary">Submit</Button>
          <Button>Cancel</Button>
        </Flex>
      </Stack>
    </Card>
  ),

  'filter-builder': (
    <Flex gap={8} style={{ flexWrap: 'wrap' }}>
      <Badge variant="primary">Status: Active</Badge>
      <Badge variant="secondary">Role: Admin</Badge>
      <Badge variant="warning">Date: Last 30 days</Badge>
      <Button size="sm">+ Add filter</Button>
    </Flex>
  ),

  'step-wizard': (
    <Box>
      <Flex gap={4} align="center" style={{ marginBottom: 16 }}>
        {['Account', 'Profile', 'Confirm'].map((step, i) => (
          <Flex key={step} align="center" gap={4}>
            <Box
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 600,
                background:
                  i === 0
                    ? 'var(--ds-color-primary)'
                    : 'var(--ds-color-neutral-200)',
                color:
                  i === 0
                    ? 'var(--ds-color-white, #fff)'
                    : 'var(--ds-color-text-muted)',
              }}
            >
              {i + 1}
            </Box>
            <Text
              size="xs"
              weight={i === 0 ? 'semibold' : 'normal'}
              style={{
                color:
                  i === 0
                    ? 'var(--ds-color-text-primary)'
                    : 'var(--ds-color-text-muted)',
              }}
            >
              {step}
            </Text>
            {i < 2 && (
              <Box
                style={{
                  width: 32,
                  height: 1,
                  background: 'var(--ds-color-border)',
                }}
              />
            )}
          </Flex>
        ))}
      </Flex>
      <Stack spacing={12}>
        <Input placeholder="Username" />
        <Input placeholder="Password" />
        <Flex gap={8} justify="end">
          <Button variant="primary">Next</Button>
        </Flex>
      </Stack>
    </Box>
  ),

  /* ---- communication ---- */
  'activity-log': (
    <Stack spacing={12}>
      {[
        'User Alice created account',
        'Admin updated permissions',
        'System backup completed',
      ].map((msg, i) => (
        <Flex key={i} gap={12} align="center">
          <Avatar size="sm">{msg[0]}</Avatar>
          <Box style={{ flex: 1 }}>
            <Text size="sm">{msg}</Text>
            <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
              {i + 1}h ago
            </Text>
          </Box>
        </Flex>
      ))}
    </Stack>
  ),

  'comment-thread': (
    <Stack spacing={16}>
      {[
        { author: 'Alice', text: 'Looks good to me. Approved.', time: '2h ago' },
        { author: 'Bob', text: 'One minor fix needed on line 42.', time: '1h ago' },
      ].map((c, i) => (
        <Flex key={i} gap={12}>
          <Avatar size="sm">{c.author[0]}</Avatar>
          <Box style={{ flex: 1 }}>
            <Flex gap={8} align="center">
              <Text size="sm" weight="semibold">{c.author}</Text>
              <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
                {c.time}
              </Text>
            </Flex>
            <Text size="sm" style={{ marginTop: 4 }}>{c.text}</Text>
          </Box>
        </Flex>
      ))}
      <Flex gap={8}>
        <Input placeholder="Write a reply..." style={{ flex: 1 }} />
        <Button size="sm" variant="primary">Reply</Button>
      </Flex>
    </Stack>
  ),

  'notification-center': (
    <Stack spacing={8}>
      {[
        { title: 'New assignment', desc: 'You have been assigned to Project X', unread: true },
        { title: 'Deploy complete', desc: 'Production deploy succeeded', unread: true },
        { title: 'Weekly report', desc: 'Your weekly summary is ready', unread: false },
      ].map((n, i) => (
        <Flex
          key={i}
          gap={12}
          align="center"
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            background: n.unread ? 'var(--ds-color-primary-50, rgba(59,130,246,0.05))' : 'transparent',
          }}
        >
          <Box
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: n.unread ? 'var(--ds-color-primary)' : 'transparent',
              flexShrink: 0,
            }}
          />
          <Box style={{ flex: 1 }}>
            <Text size="sm" weight="semibold">{n.title}</Text>
            <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>{n.desc}</Text>
          </Box>
        </Flex>
      ))}
    </Stack>
  ),

  /* ---- misc ---- */
  'empty-state': (
    <Box
      style={{
        padding: 40,
        textAlign: 'center',
        border: '1px dashed var(--ds-color-border)',
        borderRadius: 8,
      }}
    >
      <Text size="lg" weight="semibold">
        No data found
      </Text>
      <Text
        size="sm"
        style={{ color: 'var(--ds-color-text-muted)', marginTop: 8 }}
      >
        Try adjusting your filters or create a new item.
      </Text>
      <Button variant="primary" style={{ marginTop: 16 }}>
        Create New
      </Button>
    </Box>
  ),

  'pricing-table': (
    <Flex gap={16} style={{ flexWrap: 'wrap' }}>
      {[
        { plan: 'Starter', price: '$9', features: ['5 users', '10 GB', 'Email support'] },
        { plan: 'Pro', price: '$29', features: ['25 users', '100 GB', 'Priority support'] },
        { plan: 'Enterprise', price: '$99', features: ['Unlimited', '1 TB', 'Dedicated CSM'] },
      ].map((p) => (
        <Card key={p.plan} style={{ flex: '1 1 160px', padding: 16 }}>
          <Text size="sm" weight="semibold">{p.plan}</Text>
          <Text size="2xl" weight="bold" style={{ margin: '8px 0' }}>{p.price}</Text>
          <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>/month</Text>
          <Stack spacing={6} style={{ marginTop: 12 }}>
            {p.features.map((f) => (
              <Text key={f} size="xs">
                {f}
              </Text>
            ))}
          </Stack>
          <Button
            variant={p.plan === 'Pro' ? 'primary' : 'default'}
            size="sm"
            style={{ marginTop: 12, width: '100%' }}
          >
            Choose
          </Button>
        </Card>
      ))}
    </Flex>
  ),

  'user-profile-card': (
    <Card style={{ maxWidth: 280, padding: 20 }}>
      <Flex gap={12} align="center">
        <Avatar size="md">AJ</Avatar>
        <Box>
          <Text size="sm" weight="semibold">Alice Johnson</Text>
          <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
            alice@acme.com
          </Text>
        </Box>
      </Flex>
      <Flex gap={8} style={{ marginTop: 12 }}>
        <Badge variant="primary" size="sm">Admin</Badge>
        <Badge variant="success" size="sm">Active</Badge>
      </Flex>
      <Flex gap={8} style={{ marginTop: 12 }}>
        <Button size="sm" style={{ flex: 1 }}>Edit</Button>
        <Button size="sm" variant="primary" style={{ flex: 1 }}>Message</Button>
      </Flex>
    </Card>
  ),

  /* ---- workflow ---- */
  'approval-workflow': (
    <Flex gap={8} align="center">
      {[
        { label: 'Submitted', done: true },
        { label: 'Review', done: true },
        { label: 'Approved', done: false },
      ].map((step, i) => (
        <Flex key={step.label} align="center" gap={8}>
          <Box
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
              background: step.done
                ? 'var(--ds-color-success)'
                : 'var(--ds-color-neutral-200)',
              color: step.done
                ? 'var(--ds-color-white, #fff)'
                : 'var(--ds-color-text-muted)',
            }}
          >
            {step.done ? '\u2713' : i + 1}
          </Box>
          <Text size="xs" weight={step.done ? 'semibold' : 'normal'}>
            {step.label}
          </Text>
          {i < 2 && (
            <Box
              style={{
                width: 32,
                height: 2,
                background: step.done
                  ? 'var(--ds-color-success)'
                  : 'var(--ds-color-border)',
              }}
            />
          )}
        </Flex>
      ))}
    </Flex>
  ),

  /* ---- navigation ---- */
  'command-palette': (
    <Box
      style={{
        border: '1px solid var(--ds-color-border)',
        borderRadius: 8,
        overflow: 'hidden',
        maxWidth: 400,
      }}
    >
      <Box style={{ padding: '8px 12px', borderBottom: '1px solid var(--ds-color-border)' }}>
        <Input placeholder="Type a command..." />
      </Box>
      <Stack spacing={0}>
        {['Go to Dashboard', 'Create New User', 'View Reports'].map((cmd, i) => (
          <Box
            key={cmd}
            style={{
              padding: '8px 16px',
              background:
                i === 0 ? 'var(--ds-color-primary-50, rgba(59,130,246,0.05))' : 'transparent',
              cursor: 'pointer',
            }}
          >
            <Text size="sm">{cmd}</Text>
          </Box>
        ))}
      </Stack>
    </Box>
  ),
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PatternPreview({ slug }: { slug: string }) {
  const preview = PATTERN_PREVIEWS[slug];
  if (!preview) {
    return (
      <Box
        style={{
          padding: 24,
          textAlign: 'center',
          color: 'var(--ds-color-text-muted)',
        }}
      >
        <Text>Preview coming soon</Text>
      </Box>
    );
  }
  return <Box style={{ padding: 16 }}>{preview}</Box>;
}
