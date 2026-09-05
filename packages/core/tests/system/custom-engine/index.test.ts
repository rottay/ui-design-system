/**
 * @fileoverview Custom (pluggable) engine tests. Validates the full lifecycle:
 * register/unregister/clear components, pack-scoped isolation, the refusal
 * `createCustomWrapper` raises for an unregistered name, config management,
 * and useCustomStatus.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  registerCustomComponent,
  registerCustomComponents,
  unregisterCustomComponent,
  clearCustomRegistry,
  hasCustomComponent,
  getCustomComponent,
  getRegisteredComponents,
  getRegisteredComponentCount,
  getRegisteredPacks,
  configureCustomEngine,
  getCustomEngineConfig,
  createCustomWrapper,
  useCustomStatus,
} from '../../../src/infrastructure/runtime/engines/runtime/customization/component-registry';

describe('Custom Engine', () => {
  beforeEach(() => {
    clearCustomRegistry();
    configureCustomEngine({ logger: undefined });
  });

  describe('registerCustomComponent', () => {
    it('should register a component', () => {
      const MockButton = () => null;
      registerCustomComponent('Button', MockButton);
      expect(hasCustomComponent('Button')).toBe(true);
    });

    it('should allow retrieving registered component', () => {
      const MockButton = () => null;
      registerCustomComponent('Button', MockButton);
      expect(getCustomComponent('Button')).toBe(MockButton);
    });
  });

  describe('registerCustomComponents', () => {
    it('should register multiple components at once', () => {
      const MockButton = () => null;
      const MockAlert = () => null;
      const MockCard = () => null;

      registerCustomComponents({
        Button: MockButton,
        Alert: MockAlert,
        Card: MockCard,
      });

      expect(hasCustomComponent('Button')).toBe(true);
      expect(hasCustomComponent('Alert')).toBe(true);
      expect(hasCustomComponent('Card')).toBe(true);
    });
  });

  describe('unregisterCustomComponent', () => {
    it('should remove a registered component', () => {
      const MockButton = () => null;
      registerCustomComponent('Button', MockButton);
      expect(hasCustomComponent('Button')).toBe(true);

      const result = unregisterCustomComponent('Button');
      expect(result).toBe(true);
      expect(hasCustomComponent('Button')).toBe(false);
    });

    it('should return false for non-existent component', () => {
      const result = unregisterCustomComponent('NonExistent');
      expect(result).toBe(false);
    });
  });

  describe('clearCustomRegistry', () => {
    it('should remove all registered components', () => {
      registerCustomComponents({
        Button: () => null,
        Alert: () => null,
      });
      expect(getRegisteredComponentCount()).toBe(2);

      clearCustomRegistry();
      expect(getRegisteredComponentCount()).toBe(0);
    });
  });

  describe('hasCustomComponent', () => {
    it('should return true for registered components', () => {
      registerCustomComponent('Button', () => null);
      expect(hasCustomComponent('Button')).toBe(true);
    });

    it('should return false for unregistered components', () => {
      expect(hasCustomComponent('NonExistent')).toBe(false);
    });
  });

  describe('getRegisteredComponents', () => {
    it('should return list of registered component names', () => {
      registerCustomComponents({
        Button: () => null,
        Alert: () => null,
        Card: () => null,
      });

      const components = getRegisteredComponents();
      expect(components).toContain('Button');
      expect(components).toContain('Alert');
      expect(components).toContain('Card');
    });

    it('should return empty array when no components registered', () => {
      expect(getRegisteredComponents()).toHaveLength(0);
    });
  });

  describe('getRegisteredComponentCount', () => {
    it('should return correct count', () => {
      expect(getRegisteredComponentCount()).toBe(0);

      registerCustomComponent('Button', () => null);
      expect(getRegisteredComponentCount()).toBe(1);

      registerCustomComponent('Alert', () => null);
      expect(getRegisteredComponentCount()).toBe(2);
    });
  });

  describe('configureCustomEngine', () => {
    it('should update configuration', () => {
      const logger = vi.fn();
      configureCustomEngine({ logger });
      expect(getCustomEngineConfig().logger).toBe(logger);
    });

    it('carries no fallback knob at all', () => {
      // The knob was configured, reported and logged, and the resolver never
      // read it: it named one engine while another rendered.
      expect(Object.keys(getCustomEngineConfig())).toEqual(['logger']);
    });

    it('should invoke the logger during register / unregister / clear flows', () => {
      const logger = vi.fn();
      configureCustomEngine({ logger });

      registerCustomComponent('Button', () => null);
      unregisterCustomComponent('Button');
      clearCustomRegistry();

      expect(logger).toHaveBeenCalledWith('Registered custom component: Button', 'info');
      expect(logger).toHaveBeenCalledWith('Unregistered custom component: Button', 'info');
      expect(logger).toHaveBeenCalledWith('Cleared all custom components', 'info');
    });
  });

  describe('getCustomEngineConfig', () => {
    it('should return the empty default config', () => {
      expect(getCustomEngineConfig().logger).toBeUndefined();
    });

    it('should return a copy of config', () => {
      const config1 = getCustomEngineConfig();
      const config2 = getCustomEngineConfig();
      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });
  });

  describe('createCustomWrapper', () => {
    it('should resolve a registered custom component', async () => {
      const MockButton = () => null;
      registerCustomComponent('Button', MockButton);
      const resolved = await createCustomWrapper('Button')();
      expect(resolved.default).toBe(MockButton);
    });

    it('should refuse an unregistered name instead of rendering another engine', async () => {
      await expect(createCustomWrapper('Input')()).rejects.toThrow(
        /No custom implementation registered for "Input".*no fallback engine/s
      );
    });

    it('should report the refusal through the configured logger', async () => {
      const logger = vi.fn();
      configureCustomEngine({ logger });
      await expect(createCustomWrapper('Card', 'acme-pack')()).rejects.toThrow();
      expect(logger).toHaveBeenCalledWith(
        'No custom implementation for "Card" [pack: acme-pack]',
        'error'
      );
    });

    it('should refuse outright when the custom engine is disabled', async () => {
      registerCustomComponent('Tag', () => null);
      await expect(createCustomWrapper('Tag', undefined, false)()).rejects.toThrow(
        /custom engine is disabled/
      );
    });
  });

  describe('useCustomStatus', () => {
    it('should expose the current registry and config snapshot', () => {
      registerCustomComponent('Alert', () => null);
      const logger = vi.fn();
      configureCustomEngine({ logger });

      const status = useCustomStatus();

      expect(status.registeredComponents).toContain('Alert');
      expect(status.componentCount).toBe(1);
      expect(status.config.logger).toBe(logger);
      expect(status.hasComponent('Alert')).toBe(true);
      expect(status.hasComponent('Missing')).toBe(false);
    });
  });

  // ── Pack-scoped registration tests ──

  describe('pack-scoped registration', () => {
    it('should isolate components between different packs', () => {
      const AcmeButton = () => null;
      const GlobexButton = () => null;

      registerCustomComponent('Button', AcmeButton, 'acme-pack');
      registerCustomComponent('Button', GlobexButton, 'globex-pack');

      expect(getCustomComponent('Button', 'acme-pack')).toBe(AcmeButton);
      expect(getCustomComponent('Button', 'globex-pack')).toBe(GlobexButton);

      // Default pack should not have Button
      expect(hasCustomComponent('Button')).toBe(false);
    });

    it('should not cross-contaminate between packs and default', () => {
      const DefaultButton = () => null;
      const AcmeButton = () => null;

      registerCustomComponent('Button', DefaultButton);
      registerCustomComponent('Button', AcmeButton, 'acme-pack');

      expect(getCustomComponent('Button')).toBe(DefaultButton);
      expect(getCustomComponent('Button', 'acme-pack')).toBe(AcmeButton);
    });

    it('should track counts per pack independently', () => {
      registerCustomComponent('Button', () => null, 'acme-pack');
      registerCustomComponent('Alert', () => null, 'acme-pack');
      registerCustomComponent('Card', () => null, 'globex-pack');

      expect(getRegisteredComponentCount('acme-pack')).toBe(2);
      expect(getRegisteredComponentCount('globex-pack')).toBe(1);
      expect(getRegisteredComponentCount()).toBe(0); // default pack empty
    });

    it('should list components per pack', () => {
      registerCustomComponent('Button', () => null, 'acme-pack');
      registerCustomComponent('Alert', () => null, 'acme-pack');
      registerCustomComponent('Card', () => null, 'globex-pack');

      expect(getRegisteredComponents('acme-pack')).toEqual(
        expect.arrayContaining(['Button', 'Alert'])
      );
      expect(getRegisteredComponents('globex-pack')).toEqual(['Card']);
      expect(getRegisteredComponents()).toEqual([]); // default pack
    });

    it('should register multiple components into a specific pack', () => {
      const AcmeButton = () => null;
      const AcmeCard = () => null;

      registerCustomComponents(
        { Button: AcmeButton, Card: AcmeCard },
        'acme-pack'
      );

      expect(hasCustomComponent('Button', 'acme-pack')).toBe(true);
      expect(hasCustomComponent('Card', 'acme-pack')).toBe(true);
      expect(hasCustomComponent('Button')).toBe(false); // not in default
    });

    it('should unregister from a specific pack without affecting others', () => {
      registerCustomComponent('Button', () => null, 'acme-pack');
      registerCustomComponent('Button', () => null, 'globex-pack');

      unregisterCustomComponent('Button', 'acme-pack');

      expect(hasCustomComponent('Button', 'acme-pack')).toBe(false);
      expect(hasCustomComponent('Button', 'globex-pack')).toBe(true);
    });

    it('should clear only the specified pack', () => {
      registerCustomComponent('Button', () => null, 'acme-pack');
      registerCustomComponent('Alert', () => null, 'acme-pack');
      registerCustomComponent('Card', () => null, 'globex-pack');

      clearCustomRegistry('acme-pack');

      expect(getRegisteredComponentCount('acme-pack')).toBe(0);
      expect(getRegisteredComponentCount('globex-pack')).toBe(1);
    });

    it('should clear all packs when called without argument', () => {
      registerCustomComponent('Button', () => null, 'acme-pack');
      registerCustomComponent('Card', () => null, 'globex-pack');
      registerCustomComponent('Alert', () => null); // default

      clearCustomRegistry();

      expect(getRegisteredComponentCount('acme-pack')).toBe(0);
      expect(getRegisteredComponentCount('globex-pack')).toBe(0);
      expect(getRegisteredComponentCount()).toBe(0);
    });

    it('should list all registered packs via getRegisteredPacks', () => {
      registerCustomComponent('Button', () => null); // default pack
      registerCustomComponent('Alert', () => null, 'acme-pack');
      registerCustomComponent('Card', () => null, 'globex-pack');

      const packs = getRegisteredPacks();
      expect(packs).toContain('__default__');
      expect(packs).toContain('acme-pack');
      expect(packs).toContain('globex-pack');
      expect(packs).toHaveLength(3);
    });

    it('should include pack info in logger messages', () => {
      const logger = vi.fn();
      configureCustomEngine({ logger });

      registerCustomComponent('Button', () => null, 'acme-pack');
      expect(logger).toHaveBeenCalledWith(
        'Registered custom component: Button [pack: acme-pack]',
        'info'
      );

      unregisterCustomComponent('Button', 'acme-pack');
      expect(logger).toHaveBeenCalledWith(
        'Unregistered custom component: Button [pack: acme-pack]',
        'info'
      );

      registerCustomComponent('Card', () => null, 'acme-pack');
      clearCustomRegistry('acme-pack');
      expect(logger).toHaveBeenCalledWith(
        'Cleared custom components [pack: acme-pack]',
        'info'
      );
    });

    it('should resolve pack-scoped components in createCustomWrapper', async () => {
      const AcmeButton = () => null;
      const GlobexButton = () => null;

      registerCustomComponent('Button', AcmeButton, 'acme-pack');
      registerCustomComponent('Button', GlobexButton, 'globex-pack');

      expect((await createCustomWrapper('Button', 'acme-pack')()).default).toBe(AcmeButton);
      expect((await createCustomWrapper('Button', 'globex-pack')()).default).toBe(GlobexButton);

      // A pack that registers nothing under this name has no custom rendering,
      // and says so rather than borrowing another pack's or another engine's.
      await expect(createCustomWrapper('Button', 'unknown-pack')()).rejects.toThrow(
        /pack "unknown-pack"/
      );
      await expect(createCustomWrapper('Button')()).rejects.toThrow(/default pack/);
    });

    it('should scope useCustomStatus to a specific pack', () => {
      registerCustomComponent('Button', () => null, 'acme-pack');
      registerCustomComponent('Alert', () => null, 'globex-pack');
      registerCustomComponent('Card', () => null); // default

      const acmeStatus = useCustomStatus('acme-pack');
      expect(acmeStatus.registeredComponents).toEqual(['Button']);
      expect(acmeStatus.componentCount).toBe(1);
      expect(acmeStatus.hasComponent('Button')).toBe(true);
      expect(acmeStatus.hasComponent('Alert')).toBe(false);

      const defaultStatus = useCustomStatus();
      expect(defaultStatus.registeredComponents).toEqual(['Card']);
      expect(defaultStatus.componentCount).toBe(1);
      expect(defaultStatus.packs).toContain('acme-pack');
      expect(defaultStatus.packs).toContain('globex-pack');
    });
  });
});
