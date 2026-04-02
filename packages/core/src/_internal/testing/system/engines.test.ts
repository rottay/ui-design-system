/**
 * @fileoverview Engine registry tests. Validates ENGINE_REGISTRY shape,
 * getEngine/getAvailableEngines/getStableEngines lookups, isValidEngine
 * guard, and getDefaultEngine return value.
 */

import { describe, it, expect } from 'vitest';
import {
  ENGINE_REGISTRY,
  getEngine,
  getAvailableEngines,
  getStableEngines,
  isValidEngine,
  getDefaultEngine,
} from '../../../runtime/engines/registry';

describe('Engine Registry', () => {
  describe('ENGINE_REGISTRY', () => {
    it('should have all four engines defined', () => {
      expect(ENGINE_REGISTRY.classic).toBeDefined();
      expect(ENGINE_REGISTRY.modern).toBeDefined();
      expect(ENGINE_REGISTRY.rustic).toBeDefined();
      expect(ENGINE_REGISTRY.custom).toBeDefined();
    });

    it('should have correct engine names', () => {
      expect(ENGINE_REGISTRY.classic.name).toBe('classic');
      expect(ENGINE_REGISTRY.modern.name).toBe('modern');
      expect(ENGINE_REGISTRY.rustic.name).toBe('rustic');
      expect(ENGINE_REGISTRY.custom.name).toBe('custom');
    });

    it('should have correct library assignments', () => {
      expect(ENGINE_REGISTRY.classic.library).toBe('antd');
      expect(ENGINE_REGISTRY.modern.library).toBe('daisyui');
      expect(ENGINE_REGISTRY.rustic.library).toBe('html');
      expect(ENGINE_REGISTRY.custom.library).toBe('custom');
    });

    it('should have status for each engine', () => {
      expect(ENGINE_REGISTRY.classic.status).toBe('stable');
      expect(ENGINE_REGISTRY.modern.status).toBe('stable');
      expect(ENGINE_REGISTRY.rustic.status).toBe('stable');
      expect(ENGINE_REGISTRY.custom.status).toBe('experimental');
    });
  });

  describe('getEngine', () => {
    it('should return engine config for valid engine name', () => {
      const classic = getEngine('classic');
      expect(classic.name).toBe('classic');
      expect(classic.displayName).toBe('Classic (Ant Design)');
    });

    it('should return correct config for each engine', () => {
      expect(getEngine('classic').library).toBe('antd');
      expect(getEngine('modern').library).toBe('daisyui');
      expect(getEngine('rustic').library).toBe('html');
      expect(getEngine('custom').library).toBe('custom');
    });
  });

  describe('getAvailableEngines', () => {
    it('should return all engine names', () => {
      const engines = getAvailableEngines();
      expect(engines).toContain('classic');
      expect(engines).toContain('modern');
      expect(engines).toContain('rustic');
      expect(engines).toContain('custom');
    });

    it('should return exactly 4 engines', () => {
      expect(getAvailableEngines()).toHaveLength(4);
    });
  });

  describe('getStableEngines', () => {
    it('should return only stable engines', () => {
      const stableEngines = getStableEngines();
      expect(stableEngines).toContain('classic');
      expect(stableEngines).toContain('modern');
      expect(stableEngines).toContain('rustic');
      expect(stableEngines).not.toContain('custom');
    });

    it('should return 3 stable engines', () => {
      expect(getStableEngines()).toHaveLength(3);
    });
  });

  describe('isValidEngine', () => {
    it('should return true for valid engine names', () => {
      expect(isValidEngine('classic')).toBe(true);
      expect(isValidEngine('modern')).toBe(true);
      expect(isValidEngine('rustic')).toBe(true);
      expect(isValidEngine('custom')).toBe(true);
    });

    it('should return false for invalid engine names', () => {
      expect(isValidEngine('invalid')).toBe(false);
      expect(isValidEngine('')).toBe(false);
      expect(isValidEngine('react')).toBe(false);
    });
  });

  describe('getDefaultEngine', () => {
    it('should return classic as default engine', () => {
      expect(getDefaultEngine()).toBe('classic');
    });
  });
});
