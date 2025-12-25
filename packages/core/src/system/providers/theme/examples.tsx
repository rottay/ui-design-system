/**
 * ThemeProvider Usage Examples
 *
 * This file contains practical examples of how to use the ThemeProvider
 * with various configurations and scenarios.
 */

import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './index';

// ─────────────────────────────────────────────────────────────────
// EXAMPLE 1: Basic Usage - Default Rottay Theme
// ─────────────────────────────────────────────────────────────────

export function Example1_BasicUsage() {
  return (
    <ThemeProvider>
      <div>
        <h1>My App with Rottay Theme</h1>
        <p>The default Rottay theme will be loaded automatically.</p>
      </div>
    </ThemeProvider>
  );
}

// ─────────────────────────────────────────────────────────────────
// EXAMPLE 2: Custom Tenant
// ─────────────────────────────────────────────────────────────────

export function Example2_CustomTenant() {
  return (
    <ThemeProvider tenant="acme">
      <div>
        <h1>ACME Corporation App</h1>
        <p>This app uses the ACME tenant theme.</p>
        <p>If acme.css fails to load, it will fallback to Rottay.</p>
      </div>
    </ThemeProvider>
  );
}

// ─────────────────────────────────────────────────────────────────
// EXAMPLE 3: Dynamic Tenant Switching
// ─────────────────────────────────────────────────────────────────

function TenantSwitcher() {
  const { tenant, setTenant, isLoading, isFallback } = useTheme();

  return (
    <div style={{ padding: 20 }}>
      <h2>Current Tenant: {tenant}</h2>

      {isLoading && (
        <div style={{ color: 'blue' }}>Loading theme...</div>
      )}

      {isFallback && (
        <div style={{ color: 'orange' }}>
          Using Rottay fallback theme
        </div>
      )}

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <button onClick={() => setTenant && setTenant('rottay')}>
          Rottay (Default)
        </button>
        <button onClick={() => setTenant && setTenant('acme')}>
          ACME Corp
        </button>
        <button onClick={() => setTenant && setTenant('globex')}>
          Globex Inc
        </button>
        <button onClick={() => setTenant && setTenant('initech')}>
          Initech
        </button>
      </div>
    </div>
  );
}

export function Example3_DynamicSwitching() {
  return (
    <ThemeProvider>
      <TenantSwitcher />
    </ThemeProvider>
  );
}

// ─────────────────────────────────────────────────────────────────
// EXAMPLE 4: Error Handling
// ─────────────────────────────────────────────────────────────────

export function Example4_ErrorHandling() {
  const [errors, setErrors] = useState<string[]>([]);
  const [fallbacks, setFallbacks] = useState<string[]>([]);

  const handleError = (error: Error, tenant: string) => {
    console.error(`Theme error for ${tenant}:`, error);
    setErrors((prev) => [...prev, `${tenant}: ${error.message}`]);
  };

  const handleFallback = (originalTenant: string) => {
    console.warn(`Falling back from ${originalTenant} to Rottay`);
    setFallbacks((prev) => [...prev, originalTenant]);
  };

  return (
    <ThemeProvider
      tenant="nonexistent"
      onError={handleError}
      onFallback={handleFallback}
    >
      <div style={{ padding: 20 }}>
        <h2>Error Handling Example</h2>
        <p>This example tries to load a non-existent theme.</p>

        {errors.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h3>Errors:</h3>
            <ul>
              {errors.map((err, i) => (
                <li key={i} style={{ color: 'red' }}>
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}

        {fallbacks.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h3>Fallbacks:</h3>
            <ul>
              {fallbacks.map((fb, i) => (
                <li key={i} style={{ color: 'orange' }}>
                  {fb} → Rottay
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

// ─────────────────────────────────────────────────────────────────
// EXAMPLE 5: Custom CSS Location (CDN)
// ─────────────────────────────────────────────────────────────────

export function Example5_CustomCSSLocation() {
  return (
    <ThemeProvider
      tenant="acme"
      cssBaseUrl="https://cdn.example.com/themes"
    >
      <div>
        <h1>Loading from CDN</h1>
        <p>Tenant CSS will be loaded from: https://cdn.example.com/themes/acme.css</p>
      </div>
    </ThemeProvider>
  );
}

// ─────────────────────────────────────────────────────────────────
// EXAMPLE 6: Custom Branding Colors
// ─────────────────────────────────────────────────────────────────

export function Example6_CustomBranding() {
  return (
    <ThemeProvider
      tenant="rottay"
      branding={{
        primaryColor: '#FF6B00',
        accentColor: '#00A3FF',
      }}
    >
      <div style={{ padding: 20 }}>
        <h1>Custom Branding Example</h1>
        <p>These colors override the tenant theme:</p>

        <div
          style={{
            marginTop: 16,
            padding: 16,
            background: 'var(--tenant-primary)',
            color: 'white',
          }}
        >
          Primary Color: #FF6B00
        </div>

        <div
          style={{
            marginTop: 8,
            padding: 16,
            background: 'var(--tenant-accent)',
            color: 'white',
          }}
        >
          Accent Color: #00A3FF
        </div>
      </div>
    </ThemeProvider>
  );
}

// ─────────────────────────────────────────────────────────────────
// EXAMPLE 7: Theme Variant Switching
// ─────────────────────────────────────────────────────────────────

function ThemeVariantSwitcher() {
  const { theme, setTheme, tenant } = useTheme();

  return (
    <div style={{ padding: 20 }}>
      <h2>Current Theme Variant: {theme}</h2>
      <p>Tenant: {tenant}</p>

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <button onClick={() => setTheme('light')}>Light</button>
        <button onClick={() => setTheme('dark')}>Dark</button>
        <button onClick={() => setTheme('base')}>Base</button>
      </div>
    </div>
  );
}

export function Example7_ThemeVariants() {
  return (
    <ThemeProvider tenant="rottay" theme="base">
      <ThemeVariantSwitcher />
    </ThemeProvider>
  );
}

// ─────────────────────────────────────────────────────────────────
// EXAMPLE 8: Multi-Tenant Application
// ─────────────────────────────────────────────────────────────────

export function Example8_MultiTenantApp() {
  const [currentTenant, setCurrentTenant] = useState('rottay');

  // Simulate getting tenant from URL or auth
  const getTenantFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tenant') || 'rottay';
  };

  return (
    <ThemeProvider
      tenant={currentTenant}
      onError={(error, tenant) => {
        // Log to analytics
        console.error(`Failed to load ${tenant}:`, error);
      }}
      onFallback={(originalTenant) => {
        // Show user notification
        alert(`Theme for ${originalTenant} unavailable. Using default.`);
      }}
    >
      <div style={{ padding: 20 }}>
        <header>
          <h1>Multi-Tenant SaaS Application</h1>
          <select
            value={currentTenant}
            onChange={(e) => setCurrentTenant(e.target.value)}
          >
            <option value="rottay">Rottay (Default)</option>
            <option value="acme">ACME Corp</option>
            <option value="globex">Globex Inc</option>
            <option value="initech">Initech</option>
          </select>
        </header>

        <main style={{ marginTop: 20 }}>
          <p>Content themed for: {currentTenant}</p>
        </main>
      </div>
    </ThemeProvider>
  );
}

// ─────────────────────────────────────────────────────────────────
// EXAMPLE 9: Loading State UI
// ─────────────────────────────────────────────────────────────────

function LoadingStateDemo() {
  const { isLoading, isFallback, tenant, config } = useTheme();

  return (
    <div style={{ padding: 20 }}>
      <h2>Theme Loading State</h2>

      <div style={{ marginTop: 16 }}>
        <div>
          <strong>Status:</strong>{' '}
          {isLoading ? '🔄 Loading...' : '✅ Ready'}
        </div>
        <div>
          <strong>Tenant:</strong> {tenant}
        </div>
        <div>
          <strong>Fallback:</strong> {isFallback ? 'Yes ⚠️' : 'No'}
        </div>
        <div>
          <strong>CSS URL:</strong> {config?.cssUrl || 'none'}
        </div>
        <div>
          <strong>Loaded:</strong> {config?.isLoaded ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Error:</strong> {config?.isError ? 'Yes ❌' : 'No'}
        </div>
      </div>
    </div>
  );
}

export function Example9_LoadingState() {
  return (
    <ThemeProvider>
      <LoadingStateDemo />
    </ThemeProvider>
  );
}

// ─────────────────────────────────────────────────────────────────
// EXAMPLE 10: Nested Providers (NOT RECOMMENDED)
// ─────────────────────────────────────────────────────────────────

export function Example10_Nested() {
  // NOTE: Nesting is possible but not recommended
  // Inner provider will override outer provider
  return (
    <ThemeProvider tenant="rottay">
      <div>
        <h1>Outer Provider (Rottay)</h1>

        <ThemeProvider tenant="acme">
          <div style={{ padding: 20, border: '1px solid blue' }}>
            <h2>Inner Provider (ACME)</h2>
            <p>This section uses ACME theme</p>
          </div>
        </ThemeProvider>
      </div>
    </ThemeProvider>
  );
}

// ─────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────

export const examples = {
  Example1_BasicUsage,
  Example2_CustomTenant,
  Example3_DynamicSwitching,
  Example4_ErrorHandling,
  Example5_CustomCSSLocation,
  Example6_CustomBranding,
  Example7_ThemeVariants,
  Example8_MultiTenantApp,
  Example9_LoadingState,
  Example10_Nested,
};
