'use client';

/** Sticky action chrome owned by StepWizard's compact action posture. */

import type { CSSProperties, ReactNode } from 'react';

import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { useResponsive } from '@/infrastructure/runtime/responsive';
import { Box } from '@/ui/primitives/layout/Box';
import { Flex } from '@/ui/primitives/layout/Flex';

export interface StickyWizardActionsProps {
  children: ReactNode;
}

/**
 * Keeps StepWizard independent from the higher-level ActionDock structure while
 * retaining the same safe-area and virtual-keyboard behavior for fixed actions.
 */
export function StickyWizardActions({ children }: StickyWizardActionsProps) {
  const { virtualKeyboardInset, isVirtualKeyboardOpen } = useResponsive();
  const i18n = useOptionalTranslation('components');
  const style = {
    '--ds-virtual-keyboard-inset': `${Math.max(0, virtualKeyboardInset)}px`,
  } as CSSProperties;

  return (
    <Box
      className="rottay-action-dock ds-step-wizard__action-dock"
      style={style}
      data-testid="step-wizard-action-dock"
      role="toolbar"
      aria-label={i18n?.tOr('step_wizard.actions', 'Wizard actions') ?? 'Wizard actions'}
      data-part="root"
      data-placement="bottom"
      data-mode="fixed"
      data-keyboard-open={isVirtualKeyboardOpen ? 'true' : 'false'}
    >
      <Flex className="rottay-action-dock__actions" align="center">
        {children}
      </Flex>
    </Box>
  );
}
