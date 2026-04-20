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
} from '@rottay/design-system';

// ---------------------------------------------------------------------------
// Preview map -- keyed by structure slug from the registry
// ---------------------------------------------------------------------------

const STRUCTURE_PREVIEWS: Record<string, React.ReactNode> = {
  /* ---- headers ---- */
  'collection-header': (
    <Box
      style={{
        padding: '12px 16px',
        border: '1px solid var(--ds-color-border)',
        borderRadius: 8,
        background: 'var(--ds-color-bg-container)',
      }}
    >
      <Flex align="center" gap={12}>
        <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
          Dashboard
        </Text>
        <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
          /
        </Text>
        <Text size="xs">Users</Text>
      </Flex>
      <Flex align="center" gap={12} style={{ marginTop: 8 }}>
        <Text size="lg" weight="bold" style={{ flex: 1 }}>
          Users
        </Text>
        <Badge variant="secondary" size="sm">
          1,247 records
        </Badge>
        <Button size="sm" variant="primary">
          + Add User
        </Button>
      </Flex>
    </Box>
  ),

  'dashboard-header': (
    <Box
      style={{
        padding: '12px 16px',
        border: '1px solid var(--ds-color-border)',
        borderRadius: 8,
        background: 'var(--ds-color-bg-container)',
      }}
    >
      <Flex align="center" gap={12}>
        <Text size="lg" weight="bold" style={{ flex: 1 }}>
          Overview Dashboard
        </Text>
        <Badge variant="default" size="sm">
          Last 30 days
        </Badge>
        <Button size="sm">Refresh</Button>
      </Flex>
    </Box>
  ),

  'detail-header': (
    <Box
      style={{
        padding: '12px 16px',
        border: '1px solid var(--ds-color-border)',
        borderRadius: 8,
        background: 'var(--ds-color-bg-container)',
      }}
    >
      <Flex align="center" gap={8}>
        <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
          Users
        </Text>
        <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
          /
        </Text>
        <Text size="xs">Alice Johnson</Text>
      </Flex>
      <Flex align="center" gap={12} style={{ marginTop: 8 }}>
        <Text size="lg" weight="bold" style={{ flex: 1 }}>
          Alice Johnson
        </Text>
        <Badge variant="success" size="sm">
          Active
        </Badge>
        <Button size="sm">Edit</Button>
        <Button size="sm" variant="primary">
          Actions
        </Button>
      </Flex>
    </Box>
  ),

  'edit-header': (
    <Box
      style={{
        padding: '12px 16px',
        border: '1px solid var(--ds-color-border)',
        borderRadius: 8,
        background: 'var(--ds-color-bg-container)',
      }}
    >
      <Flex align="center" gap={12}>
        <Text size="lg" weight="bold" style={{ flex: 1 }}>
          Edit User
        </Text>
        <Button size="sm">Cancel</Button>
        <Button size="sm" variant="primary">
          Save Changes
        </Button>
      </Flex>
    </Box>
  ),

  /* ---- workspace ---- */
  'search-command-bar': (
    <Box
      style={{
        padding: '8px 16px',
        border: '1px solid var(--ds-color-border)',
        borderRadius: 8,
        background: 'var(--ds-color-bg-container)',
      }}
    >
      <Flex align="center" gap={12}>
        <Input
          placeholder="Search users, commands..."
          style={{ flex: 1 }}
        />
        <Box
          style={{
            padding: '2px 8px',
            borderRadius: 4,
            border: '1px solid var(--ds-color-border)',
            background: 'var(--ds-color-neutral-100)',
          }}
        >
          <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
            Cmd+K
          </Text>
        </Box>
      </Flex>
    </Box>
  ),

  'table-toolbar': (
    <Box
      style={{
        padding: '8px 16px',
        border: '1px solid var(--ds-color-border)',
        borderRadius: 8,
        background: 'var(--ds-color-bg-container)',
      }}
    >
      <Flex align="center" gap={8}>
        <Input placeholder="Search..." style={{ width: 200 }} />
        <Badge variant="secondary" size="sm">
          3 selected
        </Badge>
        <Box style={{ flex: 1 }} />
        <Button size="sm">Export</Button>
        <Button size="sm">Columns</Button>
        <Flex gap={4}>
          <Button size="sm" variant="primary">
            Table
          </Button>
          <Button size="sm">Grid</Button>
        </Flex>
      </Flex>
    </Box>
  ),

  'active-filters-bar': (
    <Box
      style={{
        padding: '8px 16px',
        border: '1px solid var(--ds-color-border)',
        borderRadius: 8,
        background: 'var(--ds-color-bg-container)',
      }}
    >
      <Flex align="center" gap={8} style={{ flexWrap: 'wrap' }}>
        <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
          Filters:
        </Text>
        <Badge variant="primary" size="sm">
          Status: Active
        </Badge>
        <Badge variant="primary" size="sm">
          Role: Admin
        </Badge>
        <Badge variant="primary" size="sm">
          Created: Last 7 days
        </Badge>
        <Button size="sm">Clear All</Button>
      </Flex>
    </Box>
  ),

  'view-mode-switcher': (
    <Flex
      gap={2}
      style={{
        padding: 4,
        border: '1px solid var(--ds-color-border)',
        borderRadius: 8,
        background: 'var(--ds-color-bg-container)',
        display: 'inline-flex',
      }}
    >
      {['Table', 'Cards', 'Kanban', 'Calendar'].map((mode, i) => (
        <Box
          key={mode}
          style={{
            padding: '4px 12px',
            borderRadius: 6,
            cursor: 'pointer',
            background:
              i === 0 ? 'var(--ds-color-primary)' : 'transparent',
            color:
              i === 0
                ? 'var(--ds-color-white, #fff)'
                : 'var(--ds-color-text-secondary)',
          }}
        >
          <Text
            size="xs"
            weight={i === 0 ? 'semibold' : 'normal'}
            style={{
              color: i === 0 ? 'var(--ds-color-white, #fff)' : undefined,
            }}
          >
            {mode}
          </Text>
        </Box>
      ))}
    </Flex>
  ),

  'export-button': (
    <Flex gap={8} align="center">
      <Button size="sm">
        Export
      </Button>
      <Box
        style={{
          padding: '4px 8px',
          border: '1px solid var(--ds-color-border)',
          borderRadius: 6,
          background: 'var(--ds-color-bg-container)',
        }}
      >
        <Flex gap={8}>
          <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>CSV</Text>
          <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>JSON</Text>
          <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>Clipboard</Text>
        </Flex>
      </Box>
    </Flex>
  ),

  /* ---- record ---- */
  'record': (
    <Box
      style={{
        border: '1px solid var(--ds-color-border)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1,
          background: 'var(--ds-color-border)',
        }}
      >
        {[
          { label: 'Name', value: 'Alice Johnson' },
          { label: 'Email', value: 'alice@acme.com' },
          { label: 'Role', value: 'Administrator' },
          { label: 'Status', value: 'Active' },
          { label: 'Created', value: '2026-01-15' },
          { label: 'Last Login', value: '2 hours ago' },
        ].map((field) => (
          <Box
            key={field.label}
            style={{ padding: '8px 12px', background: 'var(--ds-color-bg-container)' }}
          >
            <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
              {field.label}
            </Text>
            <Text size="sm" weight="medium" style={{ marginTop: 2 }}>
              {field.value}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  ),

  /* ---- dashboard ---- */
  'data-terminal-card': (
    <Card style={{ padding: 16, maxWidth: 280 }}>
      <Flex align="center" gap={8}>
        <Text size="sm" weight="semibold" style={{ flex: 1 }}>
          Monthly Revenue
        </Text>
        <Badge variant="success" size="sm">
          +12.5%
        </Badge>
      </Flex>
      <Text size="2xl" weight="bold" style={{ marginTop: 8 }}>
        $142,580
      </Text>
      <Box style={{ marginTop: 12 }}>
        <Flex gap={4} align="center">
          <Box
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: 'var(--ds-color-neutral-200)',
              overflow: 'hidden',
            }}
          >
            <Box
              style={{
                width: '72%',
                height: '100%',
                borderRadius: 2,
                background: 'var(--ds-color-primary)',
              }}
            />
          </Box>
          <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
            72% of target
          </Text>
        </Flex>
      </Box>
    </Card>
  ),

  'stats-header': (
    <Flex gap={16} style={{ flexWrap: 'wrap' }}>
      {[
        { label: 'Total Users', value: '12,847', trend: '+5.2%', positive: true },
        { label: 'Active Now', value: '342', trend: '+12%', positive: true },
        { label: 'Churn Rate', value: '2.1%', trend: '-0.3%', positive: true },
        { label: 'MRR', value: '$89.4K', trend: '+8.1%', positive: true },
      ].map((stat) => (
        <Card key={stat.label} style={{ flex: '1 1 140px', padding: 12 }}>
          <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
            {stat.label}
          </Text>
          <Text size="lg" weight="bold" style={{ marginTop: 4 }}>
            {stat.value}
          </Text>
          <Text
            size="xs"
            style={{
              color: stat.positive
                ? 'var(--ds-color-success)'
                : 'var(--ds-color-error)',
              marginTop: 4,
            }}
          >
            {stat.trend}
          </Text>
        </Card>
      ))}
    </Flex>
  ),

  /* ---- feedback ---- */
  'loading-overlay': (
    <Box
      style={{
        position: 'relative',
        padding: 40,
        borderRadius: 8,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-container)',
        minHeight: 120,
      }}
    >
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 12,
          borderRadius: 8,
          background: 'rgba(255,255,255,0.8)',
        }}
      >
        <Box
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: '3px solid var(--ds-color-neutral-200)',
            borderTopColor: 'var(--ds-color-primary)',
            animation: 'spin 1s linear infinite',
          }}
        />
        <Text size="sm" style={{ color: 'var(--ds-color-text-muted)' }}>
          Loading data...
        </Text>
      </Box>
      <Stack spacing={8}>
        <Box style={{ height: 12, width: '60%', borderRadius: 4, background: 'var(--ds-color-neutral-100)' }} />
        <Box style={{ height: 12, width: '80%', borderRadius: 4, background: 'var(--ds-color-neutral-100)' }} />
        <Box style={{ height: 12, width: '45%', borderRadius: 4, background: 'var(--ds-color-neutral-100)' }} />
      </Stack>
    </Box>
  ),

  /* ---- form-header ---- */
  'form-header': (
    <Box
      style={{
        padding: '12px 16px',
        border: '1px solid var(--ds-color-border)',
        borderRadius: 8,
        background: 'var(--ds-color-bg-container)',
      }}
    >
      <Flex align="center" gap={12}>
        <Text size="lg" weight="bold" style={{ flex: 1 }}>
          Create New User
        </Text>
        <Button size="sm">Cancel</Button>
        <Button size="sm" variant="primary">
          Save
        </Button>
      </Flex>
    </Box>
  ),

  /* ---- dashboard-insights ---- */
  'dashboard-insights': (
    <Flex gap={12} style={{ flexWrap: 'wrap' }}>
      {[
        { label: 'Conversion Rate', value: '3.2%', note: 'Up from 2.8% last week' },
        { label: 'Avg. Session', value: '4m 12s', note: 'Down 8% vs last month' },
        { label: 'Active Trials', value: '87', note: '12 expiring this week' },
      ].map((insight) => (
        <Card key={insight.label} style={{ flex: '1 1 160px', padding: 12 }}>
          <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
            {insight.label}
          </Text>
          <Text size="lg" weight="bold" style={{ marginTop: 4 }}>
            {insight.value}
          </Text>
          <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)', marginTop: 4 }}>
            {insight.note}
          </Text>
        </Card>
      ))}
    </Flex>
  ),

  /* ---- column-menu ---- */
  'column-menu': (
    <Box
      style={{
        border: '1px solid var(--ds-color-border)',
        borderRadius: 8,
        padding: 12,
        maxWidth: 220,
      }}
    >
      <Text size="xs" weight="semibold" style={{ marginBottom: 8 }}>
        Visible Columns
      </Text>
      <Stack spacing={6}>
        {[
          { name: 'Name', visible: true },
          { name: 'Email', visible: true },
          { name: 'Role', visible: true },
          { name: 'Status', visible: false },
          { name: 'Created', visible: false },
        ].map((col) => (
          <Flex key={col.name} gap={8} align="center">
            <Box
              style={{
                width: 16,
                height: 16,
                borderRadius: 3,
                border: '1px solid var(--ds-color-border)',
                background: col.visible ? 'var(--ds-color-primary)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {col.visible && (
                <Text size="xs" style={{ color: 'var(--ds-color-white, #fff)', lineHeight: 1 }}>
                  {'\u2713'}
                </Text>
              )}
            </Box>
            <Text size="xs">{col.name}</Text>
          </Flex>
        ))}
      </Stack>
    </Box>
  ),

  /* ---- saved-views-menu ---- */
  'saved-views-menu': (
    <Flex
      gap={2}
      style={{
        padding: 4,
        border: '1px solid var(--ds-color-border)',
        borderRadius: 8,
        background: 'var(--ds-color-bg-container)',
        display: 'inline-flex',
      }}
    >
      {['All Users', 'Active Only', 'Admins', 'Recent'].map((view, i) => (
        <Box
          key={view}
          style={{
            padding: '4px 12px',
            borderRadius: 6,
            cursor: 'pointer',
            background: i === 0 ? 'var(--ds-color-primary)' : 'transparent',
            color: i === 0 ? 'var(--ds-color-white, #fff)' : 'var(--ds-color-text-secondary)',
          }}
        >
          <Text
            size="xs"
            weight={i === 0 ? 'semibold' : 'normal'}
            style={{ color: i === 0 ? 'var(--ds-color-white, #fff)' : undefined }}
          >
            {view}
          </Text>
        </Box>
      ))}
    </Flex>
  ),

  /* ---- selection-preview-rail ---- */
  'selection-preview-rail': (
    <Box
      style={{
        padding: '8px 16px',
        border: '1px solid var(--ds-color-primary)',
        borderRadius: 8,
        background: 'var(--ds-color-primary-50, rgba(59,130,246,0.05))',
      }}
    >
      <Flex align="center" gap={12}>
        <Badge variant="primary" size="sm">3 selected</Badge>
        <Box style={{ flex: 1 }} />
        <Button size="sm">Deselect All</Button>
        <Button size="sm">Export</Button>
        <Button size="sm" variant="primary">
          Bulk Edit
        </Button>
      </Flex>
    </Box>
  ),

  /* ---- form-sections ---- */
  'form-sections': (
    <Stack spacing={12}>
      {[
        { title: 'Basic Information', expanded: true, fields: ['Full Name', 'Email'] },
        { title: 'Permissions', expanded: false, fields: [] },
        { title: 'Preferences', expanded: false, fields: [] },
      ].map((section) => (
        <Box
          key={section.title}
          style={{
            border: '1px solid var(--ds-color-border)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <Flex
            align="center"
            gap={8}
            style={{
              padding: '8px 12px',
              background: 'var(--ds-color-neutral-50, #f9fafb)',
              cursor: 'pointer',
            }}
          >
            <Text size="xs">{section.expanded ? '\u25BC' : '\u25B6'}</Text>
            <Text size="sm" weight="semibold" style={{ flex: 1 }}>
              {section.title}
            </Text>
          </Flex>
          {section.expanded && (
            <Box style={{ padding: 12 }}>
              <Stack spacing={8}>
                {section.fields.map((f) => (
                  <Input key={f} placeholder={f} />
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      ))}
    </Stack>
  ),
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StructurePreview({ slug }: { slug: string }) {
  const preview = STRUCTURE_PREVIEWS[slug];
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
