import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { validateTenantThemeDocument } from '@/infrastructure/compilers/composition/tenant-theme';

describe('Tabs tenant chrome contract', () => {
  it('inherits readable ink from tenant semantic channels by default', () => {
    const defaultThemeCss = readFileSync(
      resolve(process.cwd(), 'src/foundation/tokens/css/foundation/themes/default.css'),
      'utf8'
    );

    expect(defaultThemeCss).toContain('--ds-tab-color: var(--ds-color-text-secondary);');
    expect(defaultThemeCss).toContain('--ds-tab-color-hover: var(--ds-color-text-primary);');
    expect(defaultThemeCss).toContain('--ds-tab-color-active: var(--ds-color-text-primary);');
  });

  it('accepts the Pass 2 material, state and motion channels from DB theme data', () => {
    const result = validateTenantThemeDocument({
      schemaVersion: 1,
      mode: 'advanced',
      visualFoundation: {
        advanced: {
          chrome: {
            tabs: {
              listTexture:
                'radial-gradient(circle at 1px 1px, rgba(47, 107, 154, 0.16) 0.5px, transparent 0.75px)',
              listTextureOpacity: 0.14,
              listHighlight: 'inset 0 1px 0 rgba(255, 255, 255, 0.72)',
              activeHighlight:
                'linear-gradient(118deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
              activeHighlightOpacity: 0.4,
              pressedTransform: 'translateY(0) scale(0.985)',
              badgeBgActive: '#EAF2FC',
              badgeColorActive: '#285A94',
              badgeBorderActive: '#C8D9EB',
              panelTexture:
                'linear-gradient(135deg, rgba(47, 107, 154, 0.03), transparent 42%)',
              panelHighlight: 'inset 0 1px 0 rgba(255, 255, 255, 0.8)',
              overflowControlBgHover: '#F4F8FD',
              overflowControlShadowHover: '0 6px 16px rgba(20, 40, 59, 0.1)',
              activeRevealDuration: '140ms',
            },
          },
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it('keeps material channels data-only and rejects executable CSS', () => {
    const result = validateTenantThemeDocument({
      schemaVersion: 1,
      mode: 'advanced',
      visualFoundation: {
        advanced: {
          chrome: {
            tabs: {
              listTexture: 'url(javascript:alert(1))',
            },
          },
        },
      },
    });

    expect(result.success).toBe(false);
  });
});
