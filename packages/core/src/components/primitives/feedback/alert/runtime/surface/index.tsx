'use client';

/**
 * @fileoverview The alert surface - Rottay Design System.
 *
 * The one in-flow status surface of the Modern engine. Alert renders it with a
 * message line; Callout, folded into Alert, renders it with an optional title,
 * a body and an action tray. It stamps tone, density and the resolved
 * responsive padding channel on the `ds-alert` anatomy and leaves every visual
 * decision to the modern alert skin.
 *
 * @module Alert/Runtime/Surface
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { useEffect, useId, useRef, useState } from 'react';
import { partAttributes } from '@/foundation/behavior/kernel/anatomy';
import { useInteractionState } from '@/foundation/behavior/runtime/interaction-state';
import type { ResponsiveValue } from '@/foundation/contracts/kernel/responsive/values';
import {
  generateResponsiveCSS,
  isResponsiveValue,
  type ResponsivePropEntry,
} from '@/infrastructure/runtime/responsive/runtime/style-properties';
import { StatusInfoIcon } from '@/graphics/icons/semantic/generated/roles/status-info';
import { StatusSuccessIcon } from '@/graphics/icons/semantic/generated/roles/status-success';
import { StatusWarningIcon } from '@/graphics/icons/semantic/generated/roles/status-warning';
import { StatusErrorIcon } from '@/graphics/icons/semantic/generated/roles/status-error';
import { ActionCloseIcon } from '@/graphics/icons/semantic/generated/roles/action-close';
import type { AlertType } from '../../contracts';

const TONE_GLYPHS: Record<AlertType, React.ReactNode> = {
  info: <StatusInfoIcon decorative size={20} />,
  success: <StatusSuccessIcon decorative size={20} />,
  warning: <StatusWarningIcon decorative size={20} />,
  error: <StatusErrorIcon decorative size={20} />,
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface AlertSurfaceProps {
  tone: AlertType;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  showIcon?: boolean;
  action?: React.ReactNode;
  compact?: ResponsiveValue<boolean>;
  closable?: boolean;
  closeLabel: string;
  onClose?: () => void;
  /** A change of this key brings a dismissed surface back. */
  dismissKey?: string | number | null;
  announce: 'alert' | 'status';
  /** `subtle` washes one tint step lighter; it is what the folded Callout is. */
  emphasis?: 'standard' | 'subtle';
  className?: string;
  style?: React.CSSProperties;
}

function CloseButton({ label, describedBy, onClick }: { label: string; describedBy?: string; onClick: (event: React.MouseEvent<HTMLButtonElement>) => void }) {
  const interaction = useInteractionState();
  return (
    <button
      type="button"
      {...partAttributes('close-button', interaction.state)}
      {...interaction.handlers}
      onClick={onClick}
      aria-label={label}
      aria-describedby={describedBy}
    >
      <ActionCloseIcon decorative size={16} />
    </button>
  );
}

export function AlertSurface({
  tone,
  title,
  description,
  children,
  icon,
  showIcon = true,
  action,
  compact = false,
  closable = false,
  closeLabel,
  onClose,
  dismissKey = null,
  announce,
  emphasis = 'standard',
  className,
  style,
}: AlertSurfaceProps): React.ReactElement | null {
  const [dismissed, setDismissed] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const titleId = `${useId().replace(/:/g, '')}-title`;

  useEffect(() => {
    if (dismissKey === null) return;
    setDismissed(false);
  }, [dismissKey]);

  const compactIsResponsive = isResponsiveValue(compact);
  const responsive = generateResponsiveCSS(
    compactIsResponsive
      ? [
          {
            cssProperty: '--ds-alert-responsive-padding',
            value: compact,
            resolve: (dense: boolean) => (dense ? 'var(--ds-alert-compact-padding)' : 'var(--ds-alert-padding)'),
          } as ResponsivePropEntry<boolean>,
        ]
      : [],
  );

  if (dismissed) return null;

  // A keyboard dismiss moves focus to the next focusable element after the
  // surface, never to the document body.
  const handleClose = (event: React.MouseEvent<HTMLButtonElement>) => {
    const root = rootRef.current;
    if (event.detail === 0 && root) {
      const collect = (scope: ParentNode): HTMLElement[] =>
        Array.from(scope.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
          (element) => element !== root && !root.contains(element),
        );
      const inParent = collect(root.parentElement ?? document);
      const focusable = inParent.length > 0 ? inParent : collect(document);
      const after = focusable.filter((element) => root.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING);
      (after[0] ?? focusable[focusable.length - 1])?.focus({ preventScroll: true });
    }
    setDismissed(true);
    onClose?.();
  };

  return (
    <div
      ref={rootRef}
      data-part="root"
      data-tone={tone}
      data-emphasis={emphasis === 'subtle' ? 'subtle' : undefined}
      data-compact={compactIsResponsive ? 'responsive' : compact === true ? 'true' : 'false'}
      data-has-icon={showIcon ? 'true' : 'false'}
      className={`ds-alert ds-alert--modern ${className ?? ''}`.trim()}
      style={{ ...style, ...responsive.channels }}
      role={announce}
      {...responsive.attrs}
    >
      {showIcon ? <span data-part="icon">{icon || TONE_GLYPHS[tone]}</span> : null}
      <div data-part="content">
        {title ? (
          <div id={titleId} data-part="title">
            {title}
          </div>
        ) : null}
        {description ? <div data-part="description">{description}</div> : null}
        {children}
        {action ? <div data-part="actions">{action}</div> : null}
      </div>
      {closable ? <CloseButton label={closeLabel} describedBy={title ? titleId : undefined} onClick={handleClose} /> : null}
    </div>
  );
}
