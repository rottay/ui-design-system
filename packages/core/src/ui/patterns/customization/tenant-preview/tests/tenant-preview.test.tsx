/**
 * TenantPreview pattern tests
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Test the types and creation utilities that power the preview
import type { TenantPreviewProps, PreviewComponent } from '../contracts';
import {
  createTenantConfig,
  type TenantCreationConfig,
} from '../../../../../infrastructure/runtime/tenant/runtime/authoring/configuration';
import { generateTenantCss } from '../../../../../infrastructure/runtime/tenant';
import RusticTenantPreview from '../engines/rustic';

const rusticSkin = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/runtime/engines/rustic/skin/tenant-preview.css'),
  'utf8'
);
const normalizedRusticSkin = rusticSkin.replaceAll('"', "'");

describe('TenantPreview', () => {
  const sampleConfig: TenantCreationConfig = {
    slug: 'test-tenant',
    name: 'Test Tenant',
    primaryColor: '#3B82F6',
    personality: 'formal',
  };

  describe('Config generation', () => {
    it('should generate a valid TenantConfig for the preview', () => {
      const config = createTenantConfig(sampleConfig);
      expect(config.slug).toBe('test-tenant');
      expect(config.name).toBe('Test Tenant');
      expect(config.branding.primaryColor).toBe('#3B82F6');
      expect(config.personality).toBeDefined();
    });

    it('should generate CSS from the config', () => {
      const config = createTenantConfig(sampleConfig);
      const css = generateTenantCss(config);

      expect(css).toContain('test-tenant');
      expect(css).toContain('--ds-color-primary');
    });

    it('should handle all personality presets', () => {
      const presets = ['formal', 'neutral', 'playful', 'expressive'] as const;

      for (const preset of presets) {
        const config = createTenantConfig({ ...sampleConfig, personality: preset });
        const css = generateTenantCss(config);
        expect(css.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Type safety', () => {
    it('should accept valid component list', () => {
      const components: PreviewComponent[] = ['button', 'card', 'input', 'badge', 'table'];
      expect(components).toHaveLength(5);
    });

    it('should type-check TenantPreviewProps', () => {
      const props: TenantPreviewProps = {
        config: sampleConfig,
        components: ['button', 'card'],
        showColorPalette: true,
        showPersonalityInfo: false,
      };

      expect(props.config.slug).toBe('test-tenant');
      expect(props.components).toHaveLength(2);
    });
  });

  describe('CSS generation for preview', () => {
    it('should generate dark mode selectors by default', () => {
      const config = createTenantConfig(sampleConfig);
      const css = generateTenantCss(config, {
        includeDarkSelector: true,
        includeSystemDarkSelector: true,
      });

      expect(css).toContain("data-theme='dark'");
      expect(css).toContain('prefers-color-scheme: dark');
    });

    it('should generate without dark mode when disabled', () => {
      const config = createTenantConfig(sampleConfig);
      const css = generateTenantCss(config, {
        includeDarkSelector: false,
        includeSystemDarkSelector: false,
      });

      expect(css).not.toContain("data-theme='dark'");
      expect(css).not.toContain('prefers-color-scheme');
    });

    it('should include secondary color scale when provided', () => {
      const config = createTenantConfig({
        ...sampleConfig,
        secondaryColor: '#10B981',
      });
      const css = generateTenantCss(config);

      expect(css).toContain('--ds-color-secondary');
    });
  });

  describe('Rustic runtime preview', () => {
    it('renders the live preview with generated tenant CSS and token-driven sample styles', () => {
      const { container } = render(
        <RusticTenantPreview
          config={{
            ...sampleConfig,
            secondaryColor: '#10B981',
          }}
        />
      );

      const root = container.firstElementChild as HTMLDivElement | null;
      expect(root).toHaveAttribute('data-tenant', 'test-tenant');
      expect(screen.getByText('Color Palette')).toBeInTheDocument();
      expect(screen.getByText('Component Preview')).toBeInTheDocument();
      expect(screen.getByText('Personality: formal')).toBeInTheDocument();
      expect(screen.getByText('Secondary')).toBeInTheDocument();

      const primaryButton = screen.getByRole('button', { name: 'Primary' });
      expect(primaryButton.style.boxShadow).toBe('');
      expect(normalizedRusticSkin).toContain("[data-part='button'][data-variant='primary']");
      expect(rusticSkin).toContain('box-shadow: var(--ds-button-primary-shadow, var(--ds-shadow-sm));');

      const input = screen.getByPlaceholderText('Type something...');
      expect(input).toBeInTheDocument();
      expect(input.style.border).toBe('');
      expect(input.style.backgroundColor).toBe('');
      expect(normalizedRusticSkin).toContain("[data-part='sample-input'][data-part='sample-input']");
      expect(rusticSkin).toContain('background-color: var(--ds-input-bg, var(--ds-color-surface));');
    });

    it('supports hiding optional sections and rendering a focused component subset', () => {
      render(
        <RusticTenantPreview
          config={sampleConfig}
          components={['button']}
          showColorPalette={false}
          showPersonalityInfo={false}
        />
      );

      expect(screen.queryByText('Color Palette')).not.toBeInTheDocument();
      expect(screen.queryByText(/Personality:/)).not.toBeInTheDocument();
      expect(screen.getByText('Buttons')).toBeInTheDocument();
      expect(screen.queryByText('Card')).not.toBeInTheDocument();
      expect(screen.queryByText('Input')).not.toBeInTheDocument();
    });
  });
});
