/**
 * Athena Pluggable Engine Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  registerAthenaComponent,
  registerAthenaComponents,
  unregisterAthenaComponent,
  clearAthenaRegistry,
  hasAthenaComponent,
  getAthenaComponent,
  getRegisteredComponents,
  getRegisteredComponentCount,
  configureAthena,
  getAthenaConfig,
  createAthenaWrapper,
  useAthenaStatus,
} from '../../engines/athena';

describe('Athena Engine', () => {
  beforeEach(() => {
    clearAthenaRegistry();
    // Reset config to defaults
    configureAthena({
      fallbackEngine: 'classic',
      warnOnFallback: true,
      logger: undefined,
    });
  });

  describe('registerAthenaComponent', () => {
    it('should register a component', () => {
      const MockButton = () => null;
      registerAthenaComponent('Button', MockButton);
      expect(hasAthenaComponent('Button')).toBe(true);
    });

    it('should allow retrieving registered component', () => {
      const MockButton = () => null;
      registerAthenaComponent('Button', MockButton);
      expect(getAthenaComponent('Button')).toBe(MockButton);
    });
  });

  describe('registerAthenaComponents', () => {
    it('should register multiple components at once', () => {
      const MockButton = () => null;
      const MockAlert = () => null;
      const MockCard = () => null;

      registerAthenaComponents({
        Button: MockButton,
        Alert: MockAlert,
        Card: MockCard,
      });

      expect(hasAthenaComponent('Button')).toBe(true);
      expect(hasAthenaComponent('Alert')).toBe(true);
      expect(hasAthenaComponent('Card')).toBe(true);
    });
  });

  describe('unregisterAthenaComponent', () => {
    it('should remove a registered component', () => {
      const MockButton = () => null;
      registerAthenaComponent('Button', MockButton);
      expect(hasAthenaComponent('Button')).toBe(true);

      const result = unregisterAthenaComponent('Button');
      expect(result).toBe(true);
      expect(hasAthenaComponent('Button')).toBe(false);
    });

    it('should return false for non-existent component', () => {
      const result = unregisterAthenaComponent('NonExistent');
      expect(result).toBe(false);
    });
  });

  describe('clearAthenaRegistry', () => {
    it('should remove all registered components', () => {
      registerAthenaComponents({
        Button: () => null,
        Alert: () => null,
      });
      expect(getRegisteredComponentCount()).toBe(2);

      clearAthenaRegistry();
      expect(getRegisteredComponentCount()).toBe(0);
    });
  });

  describe('hasAthenaComponent', () => {
    it('should return true for registered components', () => {
      registerAthenaComponent('Button', () => null);
      expect(hasAthenaComponent('Button')).toBe(true);
    });

    it('should return false for unregistered components', () => {
      expect(hasAthenaComponent('NonExistent')).toBe(false);
    });
  });

  describe('getRegisteredComponents', () => {
    it('should return list of registered component names', () => {
      registerAthenaComponents({
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

      registerAthenaComponent('Button', () => null);
      expect(getRegisteredComponentCount()).toBe(1);

      registerAthenaComponent('Alert', () => null);
      expect(getRegisteredComponentCount()).toBe(2);
    });
  });

  describe('configureAthena', () => {
    it('should update configuration', () => {
      configureAthena({
        fallbackEngine: 'modern',
        warnOnFallback: false,
      });

      const config = getAthenaConfig();
      expect(config.fallbackEngine).toBe('modern');
      expect(config.warnOnFallback).toBe(false);
    });

    it('should preserve unmodified config values', () => {
      configureAthena({ warnOnFallback: false });
      const config = getAthenaConfig();
      expect(config.fallbackEngine).toBe('classic'); // default
    });

    it('should invoke the logger during register / unregister / clear flows', () => {
      const logger = vi.fn();
      configureAthena({ logger });

      registerAthenaComponent('Button', () => null);
      unregisterAthenaComponent('Button');
      clearAthenaRegistry();

      expect(logger).toHaveBeenCalledWith('Registered Athena component: Button', 'info');
      expect(logger).toHaveBeenCalledWith('Unregistered Athena component: Button', 'info');
      expect(logger).toHaveBeenCalledWith('Cleared all Athena components', 'info');
    });
  });

  describe('getAthenaConfig', () => {
    it('should return default config', () => {
      const config = getAthenaConfig();
      expect(config.fallbackEngine).toBe('classic');
      expect(config.warnOnFallback).toBe(true);
    });

    it('should return a copy of config', () => {
      const config1 = getAthenaConfig();
      const config2 = getAthenaConfig();
      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });
  });

  describe('createAthenaWrapper', () => {
    it('should resolve registered athena components before falling back', async () => {
      const MockButton = () => null;
      const fallbackLoader = vi.fn(async () => ({ default: (() => null) as any }));

      registerAthenaComponent('Button', MockButton);
      const loader = createAthenaWrapper('Button', fallbackLoader);
      const resolved = await loader();

      expect(resolved.default).toBe(MockButton);
      expect(fallbackLoader).not.toHaveBeenCalled();
    });

    it('should resolve fallback loaders and emit a warning when configured', async () => {
      const logger = vi.fn();
      const Fallback = () => null;
      const fallbackLoader = vi.fn(async () => ({ default: Fallback }));

      configureAthena({
        fallbackEngine: 'rustic',
        warnOnFallback: true,
        logger,
      });

      const loader = createAthenaWrapper('Input', fallbackLoader);
      const resolved = await loader();

      expect(resolved.default).toBe(Fallback);
      expect(fallbackLoader).toHaveBeenCalledTimes(1);
      expect(logger).toHaveBeenCalledWith(
        'No Athena implementation for "Input", using rustic fallback',
        'warn'
      );
    });

    it('should skip fallback warnings when warnOnFallback is disabled', async () => {
      const logger = vi.fn();
      configureAthena({
        fallbackEngine: 'modern',
        warnOnFallback: false,
        logger,
      });

      const loader = createAthenaWrapper('Card', async () => ({ default: (() => null) as any }));
      await loader();

      expect(logger).not.toHaveBeenCalled();
    });
  });

  describe('useAthenaStatus', () => {
    it('should expose the current registry and config snapshot', () => {
      registerAthenaComponent('Alert', () => null);
      configureAthena({ fallbackEngine: 'modern', warnOnFallback: false });

      const status = useAthenaStatus();

      expect(status.registeredComponents).toContain('Alert');
      expect(status.componentCount).toBe(1);
      expect(status.config.fallbackEngine).toBe('modern');
      expect(status.hasComponent('Alert')).toBe(true);
      expect(status.hasComponent('Missing')).toBe(false);
    });
  });
});
