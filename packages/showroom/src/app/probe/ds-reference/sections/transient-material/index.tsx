'use client';

import type { CSSProperties } from 'react';

import { ContextMenu, MessageItem, NotificationItem, Toast } from '@rottay/design-system';

import { SceneFrame, SpecimenRow } from '../../chrome';

// The four channels the transient skins read. Values are deliberately loud so a
// sighted reviewer can tell override from default without a colour picker.
const OVERRIDE_STYLE = {
  '--ds-material-overlay-background': '#2A1B4D',
  '--ds-material-overlay-texture':
    'repeating-linear-gradient(135deg, rgba(255,255,255,0.18) 0 6px, rgba(255,255,255,0) 6px 14px)',
  '--ds-material-overlay-border': '#A78BFA',
  '--ds-material-overlay-shadow': '0 0 0 3px #F59E0B, 0 18px 40px rgba(0,0,0,0.55)',
} as CSSProperties;

const MENU_ITEMS = [
  { key: 'open', label: 'Open reviewer' },
  { key: 'assign', label: 'Assign to me', shortcut: 'A' },
  { key: 'divide', type: 'divider' as const },
  { key: 'archive', label: 'Archive', danger: true },
];

function TransientGroup({ variant }: { variant: 'override' | 'control' }) {
  const isOverride = variant === 'override';
  return (
    <div
      data-testid={`lab-transient-${variant}`}
      style={isOverride ? OVERRIDE_STYLE : undefined}
    >
      <SpecimenRow
        axis={
          isOverride
            ? 'OVERRIDDEN --ds-material-overlay-* (background / texture / border / shadow)'
            : 'CONTROL - channels unset, defaults resolve'
        }
      >
        {/* Both skins scope their surface rule under the stack container, so a
            bare item never matches it. */}
        <div data-testid={`lab-message-${variant}`}>
          <div className="rottay-message-stack rottay-message-stack--modern" data-part="stack-container">
            <MessageItem id="lab-message" content="Roster synchronised" type="success" />
          </div>
        </div>

        <div data-testid={`lab-notification-${variant}`}>
          <div
            className="rottay-notification-stack rottay-notification-stack--modern"
            data-part="stack-container"
          >
            <NotificationItem
              id="lab-notification"
              message="Reconciliation complete"
              description="Four reviewers were updated in this run."
              type="info"
            />
          </div>
        </div>

        <div data-testid={`lab-toast-${variant}`}>
          <Toast
            visible
            variant="default"
            title="Draft saved"
            description="Your changes are stored locally."
          />
        </div>

        <div data-testid={`lab-contextmenu-${variant}`}>
          <ContextMenu
            items={MENU_ITEMS}
            trigger={
              <button
                type="button"
                data-testid={`lab-contextmenu-trigger-${variant}`}
                style={{
                  padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                  border: '1px solid var(--ds-color-border)',
                  borderRadius: 'var(--ds-radius-md)',
                  background: 'var(--ds-surface-card)',
                  color: 'var(--ds-color-text-primary)',
                }}
              >
                Right-click for actions
              </button>
            }
          />
        </div>
      </SpecimenRow>
    </div>
  );
}

export function TransientMaterialScene() {
  return (
    <SceneFrame title="TRANSIENT MATERIAL - MESSAGE + NOTIFICATION + TOAST + CONTEXT MENU">
      <TransientGroup variant="override" />
      <TransientGroup variant="control" />
    </SceneFrame>
  );
}
