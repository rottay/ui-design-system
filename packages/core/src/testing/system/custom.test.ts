/**
 * Custom Pluggable Engine Tests
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
  configureCustomEngine,
  getCustomEngineConfig,
  createCustomWrapper,
  useCustomStatus,
} from '../../engines/custom';

describe('Custom Engine', () => {
  beforeEach(() => {
    clearCustomRegistry();
    // Reset config to defaults
    configureCustomEngine({
      fallbackEngine: 'classic',
      warnOnFallback: true,
      logger: undefined,
    });
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
      configureCustomEngine({
        fallbackEngine: 'modern',
        warnOnFallback: false,
      });

      const config = getCustomEngineConfig();
      expect(config.fallbackEngine).toBe('modern');
      expect(config.warnOnFallback).toBe(false);
    });

    it('should preserve unmodified config values', () => {
      configureCustomEngine({ warnOnFallback: false });
      const config = getCustomEngineConfig();
      expect(config.fallbackEngine).toBe('classic'); // default
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
    it('should return default config', () => {
      const config = getCustomEngineConfig();
      expect(config.fallbackEngine).toBe('classic');
      expect(config.warnOnFallback).toBe(true);
    });

    it('should return a copy of config', () => {
      const config1 = getCustomEngineConfig();
      const config2 = getCustomEngineConfig();
      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });
  });

  describe('createCustomWrapper', () => {
    it('should resolve registered custom components before falling back', async () => {
      const MockButton = () => null;
      const fallbackLoader = vi.fn(async () => ({ default: (() => null) as any }));

      registerCustomComponent('Button', MockButton);
      const loader = createCustomWrapper('Button', fallbackLoader);
      const resolved = await loader();

      expect(resolved.default).toBe(MockButton);
      expect(fallbackLoader).not.toHaveBeenCalled();
    });

    it('should resolve fallback loaders and emit a warning when configured', async () => {
      const logger = vi.fn();
      const Fallback = () => null;
      const fallbackLoader = vi.fn(async () => ({ default: Fallback }));

      configureCustomEngine({
        fallbackEngine: 'rustic',
        warnOnFallback: true,
        logger,
      });

      const loader = createCustomWrapper('Input', fallbackLoader);
      const resolved = await loader();

      expect(resolved.default).toBe(Fallback);
      expect(fallbackLoader).toHaveBeenCalledTimes(1);
      expect(logger).toHaveBeenCalledWith(
        'No custom implementation for "Input", using rustic fallback',
        'warn'
      );
    });

    it('should skip fallback warnings when warnOnFallback is disabled', async () => {
      const logger = vi.fn();
      configureCustomEngine({
        fallbackEngine: 'modern',
        warnOnFallback: false,
        logger,
      });

      const loader = createCustomWrapper('Card', async () => ({ default: (() => null) as any }));
      await loader();

      expect(logger).not.toHaveBeenCalled();
    });
  });

  describe('useCustomStatus', () => {
    it('should expose the current registry and config snapshot', () => {
      registerCustomComponent('Alert', () => null);
      configureCustomEngine({ fallbackEngine: 'modern', warnOnFallback: false });

      const status = useCustomStatus();

      expect(status.registeredComponents).toContain('Alert');
      expect(status.componentCount).toBe(1);
      expect(status.config.fallbackEngine).toBe('modern');
      expect(status.hasComponent('Alert')).toBe(true);
      expect(status.hasComponent('Missing')).toBe(false);
    });
  });
});
