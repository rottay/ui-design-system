'use client';

/**
 * DISPLAY — LABELS scene — Avatar + Badge + Tag + Kbd + Tooltip.
 *
 * Five small, mostly-inline display primitives grouped because they share a
 * common visual job: annotating or labeling another element rather than
 * carrying primary page content on their own. Unlike `control` or `field`,
 * these five families are not one tight interaction grammar, so this scene
 * gives each its own labeled block (grammar row + long-content row) rather
 * than a single shared strip, then closes with a composition vignette that
 * puts several of them to work together the way a real reviewer row would.
 *
 * READINESS MARKERS. Each family's PRIMARY specimen carries a
 * `data-testid="lab-display-<family>"` wrapper — a plain `span`/`div` this
 * SCENE owns, not a prop threaded into the primitive itself. Three other
 * lanes are rewriting these families' internal DOM/class names concurrently
 * as this scene is authored, so the capture harness's readiness gate
 * (`capture-lab.mjs`, READINESS['display-labels']) is built to depend on
 * this scene's own markup instead of theirs. `BaseComponentProps` types
 * `data-testid` for most of these primitives too (confirmed against source),
 * but the wrapper is used uniformly across all four new display scenes
 * rather than mixing two techniques.
 */

import {
  Avatar,
  Badge,
  Button,
  Kbd,
  Stack,
  Tag,
  Text,
  Tooltip,
} from '@rottay/design-system';

import { PLACEHOLDER_IMAGE_SRC, SceneFrame, SpecimenRow, TORTURE_CONTENT, Vignette } from '../../chrome';

export function DisplayLabelsScene() {
  return (
    <SceneFrame title="display — labels: avatar + badge + tag + kbd + tooltip">
      {/* ---- Avatar ---- */}
      <SpecimenRow axis="avatar — image, initials, icon fallback, sizes, status, shape, group">
        <span data-testid="lab-display-avatar" style={{ display: 'inline-flex' }}>
          <Avatar src={PLACEHOLDER_IMAGE_SRC} alt="Reviewer photo" status="online" />
        </span>
        <Avatar name="Jane Doe" tone="primary" />
        <Avatar name="Committee" tone="success" status="busy" />
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <Avatar key={size} size={size} name="AB" tone="primary" />
        ))}
        <Avatar shape="square" name="Q3" tone="warning" />
        <Avatar.Group max={3}>
          <Avatar src={PLACEHOLDER_IMAGE_SRC} alt="Reviewer one" />
          <Avatar name="Jane Doe" tone="primary" />
          <Avatar name="Sam Lee" tone="success" />
          <Avatar name="Kim Park" tone="warning" />
          <Avatar name="Alex Ito" tone="danger" />
        </Avatar.Group>
        <Avatar.Badge status="online">
          <Avatar name="Live" tone="success" />
        </Avatar.Badge>
      </SpecimenRow>
      <SpecimenRow axis="avatar — long content (name overflow into initials), es, ar (RTL), unbroken token">
        <Avatar name={TORTURE_CONTENT.longLabel} tone="primary" />
        <Avatar name={TORTURE_CONTENT.spanish} tone="neutral" />
        <div dir="rtl" lang="ar">
          <Avatar name={TORTURE_CONTENT.arabic} tone="primary" />
        </div>
        <Avatar name={TORTURE_CONTENT.unbroken} tone="neutral" />
      </SpecimenRow>

      {/* ---- Badge ---- */}
      <SpecimenRow axis="badge — count, overflow, dot, pulse, standalone status label">
        <span data-testid="lab-display-badge" style={{ display: 'inline-flex' }}>
          <Badge count={5} tone="primary">
            <Button variant="outline">Notifications</Button>
          </Badge>
        </span>
        <Badge count={125} max={99} tone="danger">
          <Button variant="outline">Alerts</Button>
        </Badge>
        <Badge dot pulse tone="success">
          <Button variant="outline">Live feed</Button>
        </Badge>
        <Badge status="processing" text="Processing" />
        <Badge status="success" text="Approved" />
        <Badge status="error" text="Rejected" />
        <Badge status="warning" text="Closing soon" />
      </SpecimenRow>
      <SpecimenRow axis="badge — long content">
        <div style={{ minInlineSize: 0, maxInlineSize: 'min(280px, 100%)' }}>
          <Badge status="warning" text={TORTURE_CONTENT.longLabel} />
        </div>
        <Badge status="default" text={TORTURE_CONTENT.unbroken} />
      </SpecimenRow>

      {/* ---- Tag ---- */}
      <SpecimenRow axis="tag — tone strip, closable, group">
        <span data-testid="lab-display-tag" style={{ display: 'inline-flex' }}>
          <Tag tone="primary">Reconciliation</Tag>
        </span>
        <Tag.Group gap="sm">
          <Tag tone="success">Approved</Tag>
          <Tag tone="warning">Pending</Tag>
          <Tag tone="danger">Rejected</Tag>
          <Tag tone="neutral">Archived</Tag>
        </Tag.Group>
        <Tag tone="primary" closable onClose={() => undefined}>
          Q3 2026
        </Tag>
      </SpecimenRow>
      <SpecimenRow axis="tag — content, es, ar (RTL), unbroken token">
        <div style={{ minInlineSize: 0, maxInlineSize: 'min(260px, 100%)' }}>
          <Tag tone="neutral" style={{ maxInlineSize: '100%' }}>
            {TORTURE_CONTENT.longLabel}
          </Tag>
        </div>
        <div style={{ minInlineSize: 0, maxInlineSize: 'min(260px, 100%)' }}>
          <Tag tone="neutral" style={{ maxInlineSize: '100%' }}>
            {TORTURE_CONTENT.spanish}
          </Tag>
        </div>
        <div dir="rtl" lang="ar" style={{ minInlineSize: 0, maxInlineSize: 'min(260px, 100%)' }}>
          <Tag tone="neutral" style={{ maxInlineSize: '100%' }}>
            {TORTURE_CONTENT.arabic}
          </Tag>
        </div>
        <div style={{ minInlineSize: 0, maxInlineSize: 'min(220px, 100%)' }}>
          <Tag tone="neutral" style={{ maxInlineSize: '100%' }}>
            {TORTURE_CONTENT.unbroken}
          </Tag>
        </div>
      </SpecimenRow>

      {/* ---- Kbd ---- */}
      <SpecimenRow axis="kbd — single key, chord, sizes">
        <span data-testid="lab-display-kbd" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Kbd>Esc</Kbd>
          <Text color="secondary" style={{ margin: 0 }}>
            to dismiss
          </Text>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Kbd size="sm">Ctrl</Kbd>
          <Text style={{ margin: 0 }}>+</Text>
          <Kbd size="sm">Shift</Kbd>
          <Text style={{ margin: 0 }}>+</Text>
          <Kbd size="sm">P</Kbd>
        </span>
        <Kbd size="lg">Enter</Kbd>
      </SpecimenRow>
      <SpecimenRow axis="kbd — long chord (content torture)">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          <Kbd>Ctrl</Kbd>
          <Text style={{ margin: 0 }}>+</Text>
          <Kbd>Alt</Kbd>
          <Text style={{ margin: 0 }}>+</Text>
          <Kbd>Shift</Kbd>
          <Text style={{ margin: 0 }}>+</Text>
          <Kbd>Cmd</Kbd>
          <Text style={{ margin: 0 }}>+</Text>
          <Kbd>PageDown</Kbd>
        </span>
      </SpecimenRow>

      {/* ---- Tooltip ---- */}
      {/* Forced VISIBLE via the controlled `visible` prop — same reasoning as
          Popover/Dropdown in the overlay scene: a closed tooltip photographs
          nothing. Each gets its own reserved-height row so the two forced-open
          panels cannot collide with each other or with following content. */}
      <SpecimenRow axis="tooltip — top placement, forced visible">
        <span data-testid="lab-display-tooltip" style={{ display: 'inline-flex' }}>
          <Tooltip content="Assigned two days ago" placement="top" visible>
            <Button variant="outline">Reviewer</Button>
          </Tooltip>
        </span>
      </SpecimenRow>
      <div style={{ minBlockSize: 64 }} />
      <SpecimenRow axis="tooltip — bottom placement, long content, forced visible">
        <Tooltip content={TORTURE_CONTENT.longLabel} placement="bottom" visible>
          <Button variant="outline">Details</Button>
        </Tooltip>
      </SpecimenRow>
      <div style={{ minBlockSize: 64 }} />

      {/* ---- Composition vignette ---- */}
      <Vignette label="reviewer identity strip">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Avatar.Badge status="online">
            <Avatar name="Jane Doe" tone="primary" />
          </Avatar.Badge>
          <Stack spacing="xs">
            <Text weight="medium" style={{ margin: 0 }}>
              Jane Doe
            </Text>
            <Tag.Group gap="xs">
              <Tag tone="primary" size="sm">
                Reviewer
              </Tag>
              <Tag tone="neutral" size="sm">
                Finance
              </Tag>
            </Tag.Group>
          </Stack>
          <Badge count={3} tone="danger" />
          <Tooltip content="Keyboard shortcut: open command palette" placement="top">
            <Kbd size="sm">Ctrl</Kbd>
          </Tooltip>
        </div>
      </Vignette>
    </SceneFrame>
  );
}
