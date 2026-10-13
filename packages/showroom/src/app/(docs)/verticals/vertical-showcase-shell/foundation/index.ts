export interface VerticalCategoryCard {
  title: string;
  slug: string;
  description: string;
  demoCount: number;
  icon: React.ReactNode;
  lens: string;
}

export interface VerticalProofPoint {
  title: string;
  description: string;
}

export interface VerticalHeroMetric {
  label: string;
  value: string;
  detail: string;
}

export interface VerticalLiveDemo {
  title: string;
  description: string;
  badge: string;
  inspectionNotes: string[];
  coverageNote: string;
  viewportHeight?: number;
  children: React.ReactNode;
}

export interface VerticalShowcaseShellProps {
  name: string;
  slug: string;
  heroTitle: string;
  heroSummary: string;
  runtimeSummary: string;
  auditPoints: string[];
  heroMetrics: VerticalHeroMetric[];
  proofPoints: VerticalProofPoint[];
  leadDemo: VerticalLiveDemo;
  supportingDemos: VerticalLiveDemo[];
  categories: VerticalCategoryCard[];
  categoryIntro: string;
  accentTint: string;
  accentBorder: string;
}

export const SURFACE = 'var(--ds-color-bg-container, #ffffff)';
export const ELEVATED_SURFACE = 'var(--ds-color-bg-elevated, #f8fafc)';
export const SUBTLE_SURFACE = 'var(--ds-color-bg-secondary, #f1f5f9)';
export const BORDER = 'var(--ds-color-border, rgba(148, 163, 184, 0.28))';
export const TEXT_SECONDARY = 'var(--ds-color-text-secondary)';
export const TEXT_MUTED = 'var(--ds-color-text-muted)';
export const CARD_SHADOW = 'var(--ds-shadow-lg, 0 20px 48px rgba(15, 23, 42, 0.1))';
export const PANEL_SHADOW = 'var(--ds-shadow-md, 0 12px 28px rgba(15, 23, 42, 0.08))';
export const PANEL_BACKGROUND = `linear-gradient(180deg, color-mix(in srgb, ${ELEVATED_SURFACE} 90%, var(--ds-color-bg-secondary, #f1f5f9) 10%) 0%, ${SURFACE} 100%)`;
