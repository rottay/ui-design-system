/**
 * Responsive Hooks - Usage Examples
 *
 * These examples demonstrate how to use the responsive hooks
 * in real-world scenarios.
 */

import React from 'react';
import { useMediaQuery, useBreakpoints, useResponsiveValue } from './index';

// ============================================
// Example 1: Basic Media Query
// ============================================

export function Example1_BasicMediaQuery() {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  return (
    <div>
      <h2>Device Info</h2>
      <p>Mobile: {isMobile ? 'Yes' : 'No'}</p>
      <p>Dark Mode: {isDarkMode ? 'Yes' : 'No'}</p>
    </div>
  );
}

// ============================================
// Example 2: Breakpoint Detection
// ============================================

export function Example2_BreakpointDetection() {
  const {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    prefersReducedMotion,
  } = useBreakpoints();

  return (
    <div>
      <h2>Current Device</h2>
      <ul>
        {isMobile && <li>📱 Mobile Device</li>}
        {isTablet && <li>📟 Tablet Device</li>}
        {isDesktop && <li>🖥️ Desktop Device</li>}
        {isTouchDevice && <li>👆 Touch-enabled</li>}
        {prefersReducedMotion && <li>🐌 Reduced Motion Preferred</li>}
      </ul>
    </div>
  );
}

// ============================================
// Example 3: Responsive Navigation
// ============================================

const MobileNav = () => <nav>Mobile Navigation</nav>;
const DesktopNav = () => <nav>Desktop Navigation</nav>;

export function Example3_ResponsiveNavigation() {
  const { isMobile, isDesktop } = useBreakpoints();

  return (
    <header>
      {isMobile && <MobileNav />}
      {isDesktop && <DesktopNav />}
    </header>
  );
}

// ============================================
// Example 4: Responsive Grid
// ============================================

export function Example4_ResponsiveGrid() {
  const columns = useResponsiveValue({
    base: 1,  // Mobile: 1 column
    sm: 2,    // Small: 2 columns
    md: 3,    // Medium: 3 columns
    lg: 4,    // Large: 4 columns
  });

  const gap = useResponsiveValue({
    base: 8,
    md: 16,
    lg: 24,
  });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{ padding: 16, background: '#f0f0f0' }}>
          Item {i + 1}
        </div>
      ))}
    </div>
  );
}

// ============================================
// Example 5: Responsive Typography
// ============================================

export function Example5_ResponsiveTypography() {
  const fontSize = useResponsiveValue({
    base: '16px',
    md: '18px',
    lg: '20px',
    xl: '24px',
  });

  const lineHeight = useResponsiveValue({
    base: 1.5,
    md: 1.6,
    lg: 1.7,
  });

  return (
    <div>
      <h1 style={{ fontSize, lineHeight }}>
        Responsive Heading
      </h1>
      <p>Font size adjusts based on screen width</p>
    </div>
  );
}

// ============================================
// Example 6: Responsive Layout
// ============================================

export function Example6_ResponsiveLayout() {
  const direction = useResponsiveValue<'column' | 'row'>({
    base: 'column',
    md: 'row',
  });

  const padding = useResponsiveValue({
    base: 16,
    md: 24,
    lg: 32,
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction,
        padding: `${padding}px`,
        gap: 16,
      }}
    >
      <div style={{ flex: 1, background: '#e0e0e0', padding: 16 }}>
        Sidebar
      </div>
      <div style={{ flex: 3, background: '#f5f5f5', padding: 16 }}>
        Main Content
      </div>
    </div>
  );
}

// ============================================
// Example 7: Conditional Features
// ============================================

export function Example7_ConditionalFeatures() {
  const { isTouchDevice, prefersReducedMotion } = useBreakpoints();

  return (
    <button
      style={{
        padding: isTouchDevice ? '16px 24px' : '12px 20px',
        transition: prefersReducedMotion ? 'none' : 'all 0.3s ease',
        fontSize: isTouchDevice ? '18px' : '16px',
      }}
    >
      {isTouchDevice ? '👆 Touch-Optimized Button' : '🖱️ Regular Button'}
    </button>
  );
}

// ============================================
// Example 8: Responsive Image Sizes
// ============================================

export function Example8_ResponsiveImages() {
  const imageSize = useResponsiveValue({
    base: 'small',
    md: 'medium',
    lg: 'large',
    xl: 'xlarge',
  });

  const imageSizes = {
    small: { width: 320, height: 180 },
    medium: { width: 640, height: 360 },
    large: { width: 1024, height: 576 },
    xlarge: { width: 1920, height: 1080 },
  };

  const { width, height } = imageSizes[imageSize];

  return (
    <div>
      <img
        src={`https://via.placeholder.com/${width}x${height}`}
        alt="Responsive"
        style={{ width: '100%', height: 'auto' }}
      />
      <p>Current size: {imageSize} ({width}x{height})</p>
    </div>
  );
}

// ============================================
// Example 9: Responsive Dashboard
// ============================================

export function Example9_ResponsiveDashboard() {
  const { isMobile, isDesktop } = useBreakpoints();
  const columns = useResponsiveValue({ base: 1, md: 2, lg: 3 });
  const cardPadding = useResponsiveValue({ base: 12, md: 16, lg: 20 });

  const cards = [
    { title: 'Users', value: '1,234' },
    { title: 'Revenue', value: '$56,789' },
    { title: 'Orders', value: '890' },
  ];

  return (
    <div>
      {isMobile && <h2>Mobile Dashboard</h2>}
      {isDesktop && <h1>Desktop Dashboard</h1>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 16,
          marginTop: 16,
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              padding: cardPadding,
              background: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: 8,
            }}
          >
            <h3 style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              {card.title}
            </h3>
            <p style={{ margin: '8px 0 0', fontSize: '24px', fontWeight: 'bold' }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Example 10: Combined Usage
// ============================================

export function Example10_CombinedUsage() {
  // Use all three hooks together
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const { isMobile, isTouchDevice, prefersReducedMotion } = useBreakpoints();
  const spacing = useResponsiveValue({ base: 16, md: 24, lg: 32 });

  return (
    <div
      style={{
        padding: spacing,
        background: isDarkMode ? '#1a1a1a' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
        transition: prefersReducedMotion ? 'none' : 'all 0.3s ease',
      }}
    >
      <h2>Complete Example</h2>
      <ul>
        <li>Dark Mode: {isDarkMode ? 'Enabled' : 'Disabled'}</li>
        <li>Device: {isMobile ? 'Mobile' : 'Desktop'}</li>
        <li>Touch: {isTouchDevice ? 'Yes' : 'No'}</li>
        <li>Animations: {prefersReducedMotion ? 'Reduced' : 'Normal'}</li>
        <li>Spacing: {spacing}px</li>
      </ul>
    </div>
  );
}

// ============================================
// Export all examples
// ============================================

export const ResponsiveExamples = {
  Example1_BasicMediaQuery,
  Example2_BreakpointDetection,
  Example3_ResponsiveNavigation,
  Example4_ResponsiveGrid,
  Example5_ResponsiveTypography,
  Example6_ResponsiveLayout,
  Example7_ConditionalFeatures,
  Example8_ResponsiveImages,
  Example9_ResponsiveDashboard,
  Example10_CombinedUsage,
};
