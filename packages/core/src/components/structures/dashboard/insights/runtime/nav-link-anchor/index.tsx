'use client';

/**
 * @fileoverview The insights strips' view-all anchor, stamped with the kernel's
 * interaction state.
 *
 * @description
 * Four activity variants rendered their own byte-identical copy of this
 * adapter. They are one owner now, and the copy carried a real gap: the skins
 * draw the view-all focus ring from `--ds-focus-ring-*`, but the rule was
 * keyed on `:focus-visible` alone, so nothing in the DOM ever said the anchor
 * was keyboard-focused. The kernel decides that here and the skin's
 * `:focus-visible` arm stays as the platform's own fallback.
 *
 * Navigation still goes through `useNavigationLink()`, so a host that mounts
 * no provider gets the native `<a>`.
 *
 * @module Components/Structures/Dashboard/Insights/Runtime/NavLinkAnchor
 */

import { type ReactNode } from 'react';

import { serializeState, useInteractionState } from '@/foundation/behavior';
import { useNavigationLink } from '@/infrastructure/runtime/adapters/presentation/react/navigation';

export interface NavLinkAnchorProps {
  href: string;
  className?: string;
  children: ReactNode;
}

export function NavLinkAnchor({ href, className, children }: NavLinkAnchorProps) {
  const NavLink = useNavigationLink();
  const anchor = useInteractionState();
  const stamped = { 'data-state': serializeState(anchor.state), ...anchor.handlers };
  if (NavLink) {
    return (
      <NavLink href={href} className={className} {...stamped}>
        {children}
      </NavLink>
    );
  }
  return (
    <a href={href} className={className} {...stamped}>
      {children}
    </a>
  );
}
