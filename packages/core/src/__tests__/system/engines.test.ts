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
} from '../../system/engines/registry';

describe('Engine Registry', () => {
  describe('ENGINE_REGISTRY', () => {
    it('should have all four engines defined', () => {
      expect(ENGINE_REGISTRY.titan).toBeDefined();
      expect(ENGINE_REGISTRY.hermes).toBeDefined();
      expect(ENGINE_REGISTRY.apollo).toBeDefined();
      expect(ENGINE_REGISTRY.athena).toBeDefined();
    });

    it('should have correct engine names', () => {
      expect(ENGINE_REGISTRY.titan.name).toBe('titan');
      expect(ENGINE_REGISTRY.hermes.name).toBe('hermes');
      expect(ENGINE_REGISTRY.apollo.name).toBe('apollo');
      expect(ENGINE_REGISTRY.athena.name).toBe('athena');
    });

    it('should have correct library assignments', () => {
      expect(ENGINE_REGISTRY.titan.library).toBe('antd');
      expect(ENGINE_REGISTRY.hermes.library).toBe('daisyui');
      expect(ENGINE_REGISTRY.apollo.library).toBe('html');
      expect(ENGINE_REGISTRY.athena.library).toBe('custom');
    });

    it('should have status for each engine', () => {
      expect(ENGINE_REGISTRY.titan.status).toBe('stable');
      expect(ENGINE_REGISTRY.hermes.status).toBe('stable');
      expect(ENGINE_REGISTRY.apollo.status).toBe('stable');
      expect(ENGINE_REGISTRY.athena.status).toBe('experimental');
    });
  });

  describe('getEngine', () => {
    it('should return engine config for valid engine name', () => {
      const titan = getEngine('titan');
      expect(titan.name).toBe('titan');
      expect(titan.displayName).toBe('Titan (Ant Design)');
    });

    it('should return correct config for each engine', () => {
      expect(getEngine('titan').library).toBe('antd');
      expect(getEngine('hermes').library).toBe('daisyui');
      expect(getEngine('apollo').library).toBe('html');
      expect(getEngine('athena').library).toBe('custom');
    });
  });

  describe('getAvailableEngines', () => {
    it('should return all engine names', () => {
      const engines = getAvailableEngines();
      expect(engines).toContain('titan');
      expect(engines).toContain('hermes');
      expect(engines).toContain('apollo');
      expect(engines).toContain('athena');
    });

    it('should return exactly 4 engines', () => {
      expect(getAvailableEngines()).toHaveLength(4);
    });
  });

  describe('getStableEngines', () => {
    it('should return only stable engines', () => {
      const stableEngines = getStableEngines();
      expect(stableEngines).toContain('titan');
      expect(stableEngines).toContain('hermes');
      expect(stableEngines).toContain('apollo');
      expect(stableEngines).not.toContain('athena');
    });

    it('should return 3 stable engines', () => {
      expect(getStableEngines()).toHaveLength(3);
    });
  });

  describe('isValidEngine', () => {
    it('should return true for valid engine names', () => {
      expect(isValidEngine('titan')).toBe(true);
      expect(isValidEngine('hermes')).toBe(true);
      expect(isValidEngine('apollo')).toBe(true);
      expect(isValidEngine('athena')).toBe(true);
    });

    it('should return false for invalid engine names', () => {
      expect(isValidEngine('invalid')).toBe(false);
      expect(isValidEngine('')).toBe(false);
      expect(isValidEngine('react')).toBe(false);
    });
  });

  describe('getDefaultEngine', () => {
    it('should return titan as default engine', () => {
      expect(getDefaultEngine()).toBe('titan');
    });
  });
});
