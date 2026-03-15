/**
 * Engine Registry Tests
 */

import { describe, it, expect } from 'vitest';
import {
  ENGINE_REGISTRY,
  getEngine,
  getAvailableEngines,
  getStableEngines,
  isValidEngine,
  getDefaultEngine,
} from '../../engines/registry';

describe('Engine Registry', () => {
  describe('ENGINE_REGISTRY', () => {
    it('should have all four engines defined', () => {
      expect(ENGINE_REGISTRY.classic).toBeDefined();
      expect(ENGINE_REGISTRY.modern).toBeDefined();
      expect(ENGINE_REGISTRY.rustic).toBeDefined();
      expect(ENGINE_REGISTRY.athena).toBeDefined();
    });

    it('should have correct engine names', () => {
      expect(ENGINE_REGISTRY.classic.name).toBe('classic');
      expect(ENGINE_REGISTRY.modern.name).toBe('modern');
      expect(ENGINE_REGISTRY.rustic.name).toBe('rustic');
      expect(ENGINE_REGISTRY.athena.name).toBe('athena');
    });

    it('should have correct library assignments', () => {
      expect(ENGINE_REGISTRY.classic.library).toBe('antd');
      expect(ENGINE_REGISTRY.modern.library).toBe('daisyui');
      expect(ENGINE_REGISTRY.rustic.library).toBe('html');
      expect(ENGINE_REGISTRY.athena.library).toBe('custom');
    });

    it('should have status for each engine', () => {
      expect(ENGINE_REGISTRY.classic.status).toBe('stable');
      expect(ENGINE_REGISTRY.modern.status).toBe('stable');
      expect(ENGINE_REGISTRY.rustic.status).toBe('stable');
      expect(ENGINE_REGISTRY.athena.status).toBe('experimental');
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
      expect(getEngine('athena').library).toBe('custom');
    });
  });

  describe('getAvailableEngines', () => {
    it('should return all engine names', () => {
      const engines = getAvailableEngines();
      expect(engines).toContain('classic');
      expect(engines).toContain('modern');
      expect(engines).toContain('rustic');
      expect(engines).toContain('athena');
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
      expect(stableEngines).not.toContain('athena');
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
      expect(isValidEngine('athena')).toBe(true);
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
