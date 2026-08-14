import { describe, expect, it } from 'vitest';
import {
  TENANT_THEME_SCHEMA_VERSION,
  TENANT_VISUAL_CHANNELS,
  TENANT_THEME_V1_COVERAGE,
  type TenantVisualChannel,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  TENANT_THEME_SCHEMA_VERSION as ARTIFACT_SCHEMA_VERSION,
  TENANT_VISUAL_CHANNELS as ARTIFACT_VISUAL_CHANNELS,
  TENANT_THEME_V1_COVERAGE as ARTIFACT_V1_COVERAGE,
  type TenantVisualChannel as ArtifactTenantVisualChannel,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme/artifact-protocol';

describe('tenant-theme artifact-protocol', () => {
  it('re-exports the same bindings from the full contract and the protocol leaf', () => {
    expect(TENANT_THEME_SCHEMA_VERSION).toBe(ARTIFACT_SCHEMA_VERSION);
    expect(TENANT_VISUAL_CHANNELS).toBe(ARTIFACT_VISUAL_CHANNELS);
    expect(TENANT_THEME_V1_COVERAGE).toBe(ARTIFACT_V1_COVERAGE);
    expect(TENANT_THEME_V1_COVERAGE).toEqual([
      'visual-branding',
      'token-overrides',
      'appearance',
      'brand-chrome',
    ]);
  });

  it('keeps the channel and coverage order identical and deep-frozen', () => {
    expect(Object.isFrozen(TENANT_VISUAL_CHANNELS)).toBe(true);
    expect(Object.isFrozen(ARTIFACT_VISUAL_CHANNELS)).toBe(true);
    expect(Object.isFrozen(TENANT_THEME_V1_COVERAGE)).toBe(true);
    expect([...TENANT_THEME_V1_COVERAGE]).toEqual(
      (TENANT_VISUAL_CHANNELS as readonly TenantVisualChannel[]).filter(
        (channel) => channel !== 'personality',
      ),
    );
    expect([...TENANT_VISUAL_CHANNELS]).toEqual([
      'visual-branding',
      'token-overrides',
      'appearance',
      'brand-chrome',
      'personality',
    ]);
    expect([...ARTIFACT_VISUAL_CHANNELS]).toEqual([
      'visual-branding',
      'token-overrides',
      'appearance',
      'brand-chrome',
      'personality',
    ]);
  });

  it('type-only re-export matches the protocol type', () => {
    const channel: TenantVisualChannel = 'appearance';
    const aliasChannel: ArtifactTenantVisualChannel = channel;
    expect(aliasChannel).toBe('appearance');
  });
});
