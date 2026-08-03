/**
 * @fileoverview DataTerminalCard — structures-tier dashboard metric card
 * with four animated visual variants.
 *
 * @description
 * Engine-free structures family for dashboard surfaces. Renders a single
 * metric card with a "Terminal / HUD / Circuit / Matrix" visual theme,
 * a trend indicator, an optional progress bar, and an href that turns the
 * whole card into a link via the DS navigation adapter. Consumers compose
 * multiple cards into a dashboard grid or drop a single card into a widget
 * slot.
 *
 * ANATOMY (Pass 1, documented): terminal-chrome header + icon/label block +
 * hero value + 3-stat grid (change/period/target) + progress bar + footer.
 * The card composes ONLY layout primitives (Box/Flex/Text) and governed
 * icons today.
 *
 * KNOWN DEBTS (checkpoint-level, documented — not half-fixed):
 *  - Card P05 / Statistic P15 / Button P34 / Skeleton P30 are NOT composed:
 *    the value/stat grammar, the card frame and the loading state are own
 *    grammar (see stats-grid PT16 for the pattern-side metric grammar).
 *  - QuickAction buttons are DEAD (the props contract exposes no action
 *    callbacks; they preventDefault to keep the card-link intact). Their
 *    labels are localized chrome, but the affordance itself is a contract
 *    gap.
 *  - ActivityIndicator "simulates data activity" — decorative, not data.
 *  - The variant falls back to a Math.random page seed when neither the
 *    prop nor the provider pins one (nondeterministic theming by design).
 *
 * PAINT + GEOMETRY LAW: every static declaration — paint tones, typography,
 * layout geometry, spacing — is owned by the skin
 * (foundation/tokens/css/presentation/components/skin/data-terminal-card.css),
 * transcribed verbatim and expressed in logical properties. Only runtime
 * channels stay inline: the `--ds-dtc-live` ring-colour hatch, the
 * ProgressBar `height` prop + `--ds-dtc-radius` hatch, the progress fill
 * width (data) and the activity-bar stagger delay.
 *
 * MOTION LAW: every `animation`/`transition` declaration lives in the skin
 * (channeled, reduced-motion-guarded durations derived from `--ds-motion-*`
 * rungs). No `!important` is needed anywhere in this family: because no
 * animation stays inline, the skin's reduced-motion guard silences every
 * loop directly — the former inline animations were unsilenceable without
 * it, which is exactly why they were drained.
 *
 * COPY LAW: all owned chrome copy resolves through the optional
 * `components` i18n channel with an English floor; numbers format with the
 * active locale. Consumer data (label/value/change/subtitle) is never copy.
 *
 * The component is framework-agnostic:
 *   - Navigation goes through `useNavigationLink()` from the DS runtime
 *     so consumers in Next.js, Remix, plain React, etc. all work as
 *     long as they mount the corresponding adapter provider (or fall
 *     back to the native `<a>` when no provider is mounted).
 *   - Focus state comes from `useDsFocusMode()` so apps that expose a
 *     focus-mode experience can mount `<FocusModeProvider>` and have
 *     the card dim/highlight appropriately.
 *
 * Contract cleanup (trend/progress/path shape normalization) is
 * planned for a later checkpoint; for now the public API is unchanged
 * from its original extraction shape.
 */
'use client';

import { useMemo, createContext, useContext, type CSSProperties, type ReactNode } from 'react';
import { Box, Text, Flex } from '@/ui/primitives';
import { useNavigationLink } from '@/infrastructure/runtime/adapters/presentation/react/navigation';
import { useDsFocusMode } from '@/infrastructure/runtime/adapters/presentation/react/focus-mode';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import {
  ActivityIcon as Activity,
  ArrowRightIcon as ArrowRight,
  BarChart3Icon as BarChart3,
  EyeIcon as Eye,
  PlusIcon as Plus,
  TrendingDownIcon as TrendingDown,
  TrendingUpIcon as TrendingUp,
} from '../../../../graphics/icons';
import type { ComponentType } from 'react';
type DataTerminalIcon = ComponentType<any>;

/** Hook-local translation: catalogue value with an English floor (never a
    raw key), plus the active locale for number formatting. */
function useDtcTranslation() {
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, floor: string): string => i18n?.tOr(key, floor) ?? floor;
  const locale = i18n?.locale ?? 'default';
  return { tOr, locale };
}

/**
 * Internal Link wrapper that resolves the consumer-supplied Link via the
 * NavigationLinkProvider context, falling back to a native `<a>` when no
 * provider is mounted. This keeps the DS pattern framework-agnostic
 * (mirrors the Wave 5.1 follow-up adapter pattern used by SurfaceReadField).
 * The anchor carries the family's own link class so the skin can paint the
 * keyboard focus ring (a consumer-supplied adapter owns its DOM, so the hook
 * is a class, not a data-part).
 */
function NavLinkAnchor({ href, children }: { href: string; children: ReactNode }) {
  const NavLink = useNavigationLink();
  if (NavLink) {
    return (
      <NavLink href={href} className="ds-data-terminal-card__link">
        {children}
      </NavLink>
    );
  }
  return (
    <a href={href} className="ds-data-terminal-card__link">
      {children}
    </a>
  );
}

export interface DataTerminalCardProps {
  label: string;
  value: number | string;
  change?: string;
  trend?: 'up' | 'down';
  icon: DataTerminalIcon;
  path: string;
  progress?: number;
  subtitle?: string;
  hideOnFocus?: boolean;
  variant?: 1 | 2 | 3 | 4;
}

// Design System CSS Variables — only the tones still read at runtime survive
// here (getProgressColor's threshold bucket + LiveIndicator's default). Every
// static surface/text/border tone now lives in the skin
// (foundation/tokens/css/presentation/components/skin/data-terminal-card.css).
const DS = {
  success: 'var(--ds-color-success)',
  error: 'var(--ds-color-error)',
  warning: 'var(--ds-color-warning)',
};

// Context for consistent variant
const VariantContext = createContext<1 | 2 | 3 | 4 | null>(null);

function getPageVariant(): 1 | 2 | 3 | 4 {
  if (typeof window === 'undefined') return 1;
  let seed = (window as unknown as { __cardVariantSeed?: number }).__cardVariantSeed;
  if (!seed) {
    seed = Math.floor(Math.random() * 4) + 1;
    (window as unknown as { __cardVariantSeed?: number }).__cardVariantSeed = seed;
  }
  return seed as 1 | 2 | 3 | 4;
}

export function DataTerminalCardProvider({ children, variant }: { children: ReactNode; variant?: 1 | 2 | 3 | 4 }) {
  const pageVariant = useMemo(() => variant ?? getPageVariant(), [variant]);
  return <VariantContext.Provider value={pageVariant}>{children}</VariantContext.Provider>;
}

// Utility function for progress color
function getProgressColor(progress: number): string {
  if (progress >= 80) return DS.success;
  if (progress >= 50) return DS.warning;
  return DS.error;
}

// Live indicator component (the pulse/ring animation and all geometry are
// skin-owned; only the caller-passed ring colour rides an inline hatch)
function LiveIndicator({ color = DS.success }: { color?: string }) {
  const { tOr } = useDtcTranslation();
  return (
    <Flex align="center" gap={6} style={{ '--ds-dtc-live': color } as CSSProperties}>
      <Box data-part="live-dot">
        <Box data-part="live-pulse-ring" />
        <Box data-part="live-ring" />
      </Box>
      <Text data-part="live-label">
        {tOr('dataTerminalCard.live', 'LIVE')}
      </Text>
    </Flex>
  );
}

// Activity indicator - simulates data activity (DECORATIVE, see header debts)
// Per-bar heights are skin-owned (keyed on data-bar-index); heights are stable
// across renders to avoid impure Math.random() during render.
function ActivityIndicator() {
  return (
    <Flex align="center" gap={2}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Box
          key={i}
          data-part="activity-bar"
          data-bar-index={i}
          style={{
            /* Only the runtime stagger stays inline; the cadence is skin-owned. */
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </Flex>
  );
}

// Quick action button (DEAD affordance — contract gap, see header debts)
function QuickAction({ icon: Icon, label }: { icon: DataTerminalIcon; label: string }) {
  return (
    <Box
      as="button"
      data-part="quick-action"
      onClick={(e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Icon data-part="quick-action-icon" />
      <Text data-part="quick-action-label">
        {label}
      </Text>
    </Box>
  );
}

// Progress bar component (motion + static geometry are skin-owned; the
// `height` prop, the radius hatch and the fill width stay inline as data)
function ProgressBar({ progress, height = 4 }: { progress: number; height?: number }) {
  // Radius is `height / 2` — computed from a runtime prop, so it rides a
  // custom-property hatch the track sets and both track + fill read.
  return (
    <Box
      data-part="progress-track"
      style={
        {
          height,
          '--ds-dtc-radius': `${height / 2}px`,
        } as CSSProperties
      }
    >
      <Box
        data-part="progress-fill"
        data-band={progress >= 80 ? 'high' : progress >= 50 ? 'mid' : 'low'}
        style={{
          width: `${progress}%`,
        }}
      >
        {/* Shimmer effect (motion is skin-owned) */}
        <Box data-part="progress-shimmer" />
      </Box>
    </Box>
  );
}

// Stats item component for consistent layout
function StatItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box data-part="stat-item">
      <Text data-part="stat-item-label">
        {label}
      </Text>
      <Box>{children}</Box>
    </Box>
  );
}

/**
 * VARIANT 1: Command - Terminal style
 */
function CommandCard({
  label,
  value,
  change,
  trend = 'up',
  icon: Icon,
  path,
  progress = 0,
  subtitle,
}: Omit<DataTerminalCardProps, 'variant' | 'hideOnFocus'>) {
  const { tOr, locale } = useDtcTranslation();
  const isPositive = trend === 'up';

  return (
    <NavLinkAnchor href={path}>
      <Box
        className="ds-data-terminal-card"
        data-part="root"
        data-variant="1"
        data-trend={trend}
        data-band={progress >= 80 ? 'high' : progress >= 50 ? 'mid' : 'low'}
      >
        {/* Terminal header */}
        <Box data-part="terminal-bar">
          <Flex align="center" gap={10}>
            <Flex gap={5}>
              <Box data-part="terminal-dot" />
              <Box data-part="terminal-dot" />
              <Box data-part="terminal-dot" />
            </Flex>
            <Text data-part="terminal-filename">
              {label.toLowerCase().replace(/\s+/g, '_')}.sys
            </Text>
          </Flex>
          <Flex align="center" gap={8}>
            <ActivityIndicator />
            <Box data-part="heartbeat-dot" />
          </Flex>
        </Box>

        {/* Content */}
        <Box data-part="content">
          {/* Command prompt header */}
          <Box data-part="prompt-header">
            <Flex align="center" gap={8}>
              <Text data-part="prompt-symbol">
                $
              </Text>
              <Icon data-part="prompt-icon" />
              <Text data-part="prompt-label">
                {label.toUpperCase()}
              </Text>
              <Box data-part="cursor" />
            </Flex>
          </Box>

          {/* Main value section */}
          <Box data-part="value-section">
            <Text data-part="value">
              {typeof value === 'number' ? value.toLocaleString(locale) : value}
            </Text>
          </Box>

          {/* Stats grid - well segmented */}
          <Box data-part="stats-grid">
            <StatItem label={tOr('dataTerminalCard.statChange', 'CHANGE')}>
              <Flex align="center" gap={4}>
                {isPositive ? (
                  <TrendingUp data-part="trend-icon" />
                ) : (
                  <TrendingDown data-part="trend-icon" />
                )}
                <Text data-part="change-value">
                  {change || '--'}
                </Text>
              </Flex>
            </StatItem>
            <StatItem label={tOr('dataTerminalCard.statPeriod', 'PERIOD')}>
              <Text data-part="period-value">
                {subtitle || tOr('dataTerminalCard.periodDefaultWeek', 'This week')}
              </Text>
            </StatItem>
            <StatItem label={tOr('dataTerminalCard.statTarget', 'TARGET')}>
              <Text data-part="target-value">
                {progress}%
              </Text>
            </StatItem>
          </Box>

          {/* Progress bar section */}
          <Box data-part="progress-section">
            <ProgressBar progress={progress} height={5} />
          </Box>
        </Box>

        {/* Actions footer (DEAD affordances — contract gap, see header) */}
        <Box data-part="actions-footer">
          <Flex gap={8}>
            <QuickAction icon={Eye} label={tOr('dataTerminalCard.actionView', 'VIEW')} />
            <QuickAction icon={Plus} label={tOr('dataTerminalCard.actionAdd', 'ADD')} />
            <QuickAction icon={BarChart3} label={tOr('dataTerminalCard.actionStats', 'STATS')} />
          </Flex>
        </Box>
      </Box>
    </NavLinkAnchor>
  );
}

/**
 * VARIANT 2: HUD - Heads-up display
 */
function HUDCard({
  label,
  value,
  change,
  trend = 'up',
  icon: Icon,
  path,
  progress = 0,
  subtitle,
}: Omit<DataTerminalCardProps, 'variant' | 'hideOnFocus'>) {
  const { tOr, locale } = useDtcTranslation();
  const isPositive = trend === 'up';
  const statusLabel =
    progress >= 80
      ? tOr('dataTerminalCard.statusOptimal', 'OPTIMAL')
      : progress >= 50
        ? tOr('dataTerminalCard.statusModerate', 'MODERATE')
        : tOr('dataTerminalCard.statusAttention', 'ATTENTION');

  return (
    <NavLinkAnchor href={path}>
      <Box
        className="ds-data-terminal-card"
        data-part="root"
        data-variant="2"
        data-trend={trend}
        data-band={progress >= 80 ? 'high' : progress >= 50 ? 'mid' : 'low'}
      >
        {/* Grid texture (motion is skin-owned) */}
        <Box data-part="grid-texture" />

        {/* Scan line (motion is skin-owned) */}
        <Box data-part="scan-line" />

        {/* Corner brackets (motion is skin-owned) */}
        <Box data-part="corner-bracket" />
        <Box data-part="corner-bracket" />
        <Box data-part="corner-bracket" />
        <Box data-part="corner-bracket" />

        {/* Content */}
        <Box data-part="content">
          {/* Header section */}
          <Box data-part="section-divider">
            <Flex align="start" justify="between">
              <Flex align="center" gap={12}>
                <Box data-part="header-icon-box">
                  <Icon data-part="header-icon" />
                </Box>
                <Box>
                  <Text data-part="tracking-label">
                    {tOr('dataTerminalCard.tracking', 'TRACKING')}
                  </Text>
                  <Text data-part="header-label">
                    {label.toUpperCase()}
                  </Text>
                </Box>
              </Flex>
              <Box data-part="status-badge">
                <Flex align="center" gap={6}>
                  <Box data-part="status-dot" />
                  <Text data-part="status-label">
                    {statusLabel}
                  </Text>
                </Flex>
              </Box>
            </Flex>
          </Box>

          {/* Main value section */}
          <Box data-part="value-section">
            <Text data-part="value">
              {typeof value === 'number' ? value.toLocaleString(locale) : value}
            </Text>
            <Flex align="center" gap={12} data-part="trend-row">
              <Box data-part="trend-badge">
                <Flex align="center" gap={6}>
                  {isPositive ? (
                    <TrendingUp data-part="trend-icon" />
                  ) : (
                    <TrendingDown data-part="trend-icon" />
                  )}
                  <Text data-part="change-value">
                    {change || '--'}
                  </Text>
                </Flex>
              </Box>
              <Text data-part="period-value">
                {subtitle || tOr('dataTerminalCard.periodDefaultPeriod', 'this period')}
              </Text>
            </Flex>
          </Box>

          {/* Bottom stats section */}
          <Box data-part="stats-panel">
            <Flex align="center" justify="between">
              <Box>
                <Text data-part="completion-label">
                  {tOr('dataTerminalCard.completion', 'COMPLETION')}
                </Text>
                <Text data-part="completion-value">
                  {progress}%
                </Text>
              </Box>
              <Box data-part="progress-slot">
                <ProgressBar progress={progress} height={6} />
              </Box>
              <Flex align="center" gap={8}>
                <Activity data-part="details-icon" />
                <Text data-part="details-label">
                  {tOr('dataTerminalCard.details', 'DETAILS')}
                </Text>
                <ArrowRight data-part="details-arrow" />
              </Flex>
            </Flex>
          </Box>
        </Box>
      </Box>
    </NavLinkAnchor>
  );
}

/**
 * VARIANT 3: Circuit - Circuit board aesthetic
 */
function CircuitCard({
  label,
  value,
  change,
  trend = 'up',
  icon: Icon,
  path,
  progress = 0,
  subtitle,
}: Omit<DataTerminalCardProps, 'variant' | 'hideOnFocus'>) {
  const { tOr, locale } = useDtcTranslation();
  const isPositive = trend === 'up';
  const progressColor = getProgressColor(progress);

  return (
    <NavLinkAnchor href={path}>
      <Box
        className="ds-data-terminal-card"
        data-part="root"
        data-variant="3"
        data-trend={trend}
        data-band={progress >= 80 ? 'high' : progress >= 50 ? 'mid' : 'low'}
      >
        {/* Circuit pattern */}
        <Box data-part="circuit-pattern" />

        {/* Data flow line (motion is skin-owned) */}
        <Box data-part="flow-line" />

        {/* Node indicators (motion is skin-owned) */}
        <Box data-part="node-dot" />
        <Box data-part="node-dot-live" />
        <Box data-part="node-dot" />
        <Box data-part="node-dot" />

        {/* Content */}
        <Box data-part="content">
          {/* Header section */}
          <Box data-part="section-divider">
            <Flex align="center" justify="between">
              <Flex align="center" gap={10}>
                <Box data-part="header-icon-box">
                  <Icon data-part="header-icon" />
                </Box>
                <Box>
                  <Text data-part="metric-label">
                    {tOr('dataTerminalCard.metric', 'METRIC')}
                  </Text>
                  <Text data-part="header-label">
                    {label.toUpperCase()}
                  </Text>
                </Box>
              </Flex>
              <Flex align="center" gap={10}>
                <ActivityIndicator />
                <LiveIndicator color={progressColor} />
              </Flex>
            </Flex>
          </Box>

          {/* Main value section */}
          <Box data-part="value-section">
            <Text data-part="value">
              {typeof value === 'number' ? value.toLocaleString(locale) : value}
            </Text>
          </Box>

          {/* Stats grid section */}
          <Box data-part="stats-grid">
            <StatItem label={tOr('dataTerminalCard.statChange', 'CHANGE')}>
              <Flex align="center" gap={4}>
                {isPositive ? (
                  <TrendingUp data-part="trend-icon" />
                ) : (
                  <TrendingDown data-part="trend-icon" />
                )}
                <Text data-part="change-value">
                  {change || '--'}
                </Text>
              </Flex>
            </StatItem>
            <StatItem label={tOr('dataTerminalCard.statPeriod', 'PERIOD')}>
              <Text data-part="period-value">
                {subtitle || tOr('dataTerminalCard.periodDefaultWeek', 'This week')}
              </Text>
            </StatItem>
            <StatItem label={tOr('dataTerminalCard.statTarget', 'TARGET')}>
              <Text data-part="target-value">
                {progress}%
              </Text>
            </StatItem>
          </Box>

          {/* Progress section */}
          <Box data-part="progress-section">
            <ProgressBar progress={progress} height={5} />
          </Box>

          {/* Actions footer (DEAD affordances — contract gap, see header) */}
          <Flex gap={8}>
            <QuickAction icon={Eye} label={tOr('dataTerminalCard.actionView', 'VIEW')} />
            <QuickAction icon={BarChart3} label={tOr('dataTerminalCard.actionAnalytics', 'ANALYTICS')} />
          </Flex>
        </Box>
      </Box>
    </NavLinkAnchor>
  );
}

/**
 * VARIANT 4: Matrix - Data grid with sectored stats
 */
function MatrixCard({
  label,
  value,
  change,
  trend = 'up',
  icon: Icon,
  path,
  progress = 0,
  subtitle,
}: Omit<DataTerminalCardProps, 'variant' | 'hideOnFocus'>) {
  const { tOr, locale } = useDtcTranslation();
  const isPositive = trend === 'up';

  return (
    <NavLinkAnchor href={path}>
      <Box
        className="ds-data-terminal-card"
        data-part="root"
        data-variant="4"
        data-trend={trend}
        data-band={progress >= 80 ? 'high' : progress >= 50 ? 'mid' : 'low'}
      >
        {/* Dot matrix texture (motion is skin-owned) */}
        <Box data-part="matrix-texture" />

        {/* Content */}
        <Box data-part="content">
          {/* Header section */}
          <Box data-part="section-divider">
            <Flex align="center" justify="between">
              <Flex align="center" gap={10}>
                <Box data-part="header-icon-box">
                  <Icon data-part="header-icon" />
                </Box>
                <Box>
                  <Text data-part="datapoint-label">
                    {tOr('dataTerminalCard.dataPoint', 'DATA POINT')}
                  </Text>
                  <Text data-part="header-label">
                    {label.toUpperCase()}
                  </Text>
                </Box>
              </Flex>
              <LiveIndicator color={DS.success} />
            </Flex>
          </Box>

          {/* Main value section */}
          <Box data-part="value-section">
            <Text data-part="value">
              {typeof value === 'number' ? value.toLocaleString(locale) : value}
            </Text>
          </Box>

          {/* Stats grid section */}
          <Box data-part="stats-grid">
            <StatItem label={tOr('dataTerminalCard.statChange', 'CHANGE')}>
              <Flex align="center" gap={4}>
                {isPositive ? (
                  <TrendingUp data-part="trend-icon" />
                ) : (
                  <TrendingDown data-part="trend-icon" />
                )}
                <Text data-part="change-value">
                  {change || '--'}
                </Text>
              </Flex>
            </StatItem>
            <StatItem label={tOr('dataTerminalCard.statPeriod', 'PERIOD')}>
              <Text data-part="period-value">
                {subtitle || tOr('dataTerminalCard.periodDefaultWeek', 'This week')}
              </Text>
            </StatItem>
            <StatItem label={tOr('dataTerminalCard.statTarget', 'TARGET')}>
              <Text data-part="target-value">
                {progress}%
              </Text>
            </StatItem>
          </Box>

          {/* Progress section */}
          <Box data-part="progress-section">
            <ProgressBar progress={progress} height={4} />
          </Box>

          {/* Footer section */}
          <Flex align="center" justify="between" data-part="footer">
            <ActivityIndicator />
            <Flex align="center" gap={6}>
              <Text data-part="details-label">
                {tOr('dataTerminalCard.viewDetails', 'VIEW DETAILS')}
              </Text>
              <ArrowRight data-part="details-arrow" />
            </Flex>
          </Flex>
        </Box>
      </Box>
    </NavLinkAnchor>
  );
}

/**
 * Main DataTerminalCard component
 */
export function DataTerminalCard({
  label,
  value,
  change,
  trend = 'up',
  icon,
  path,
  progress = 0,
  subtitle,
  hideOnFocus = true,
  variant: propVariant,
}: DataTerminalCardProps) {
  const isFocusMode = useDsFocusMode();
  const shouldHide = hideOnFocus && isFocusMode;
  const contextVariant = useContext(VariantContext);

  const variant = useMemo(() => {
    if (propVariant) return propVariant;
    if (contextVariant) return contextVariant;
    return getPageVariant();
  }, [propVariant, contextVariant]);

  if (shouldHide) return null;

  const props = { label, value, change, trend, icon, path, progress, subtitle };

  switch (variant) {
    case 1:
      return <CommandCard {...props} />;
    case 2:
      return <HUDCard {...props} />;
    case 3:
      return <CircuitCard {...props} />;
    case 4:
    default:
      return <MatrixCard {...props} />;
  }
}

/**
 * DataTerminalStat - Smaller stat variant
 */
export function DataTerminalStat({
  label,
  value,
  change,
  trend = 'up',
  icon: Icon,
  progress = 0,
}: Omit<DataTerminalCardProps, 'path'>) {
  const { locale } = useDtcTranslation();
  const isPositive = trend === 'up';

  return (
    <Box
      className="ds-data-terminal-stat"
      data-part="root"
      data-trend={trend}
      data-band={progress >= 80 ? 'high' : progress >= 50 ? 'mid' : 'low'}
    >
      <Box data-part="corner-bracket" />
      <Box data-part="corner-bracket" />

      <Flex align="center" gap={6} data-part="stat-header">
        <Icon data-part="stat-icon" />
        <Text data-part="stat-label">
          {label.toUpperCase()}
        </Text>
      </Flex>

      <Box data-part="value-section">
        <Flex align="baseline" gap={6}>
          <Text data-part="value">
            {typeof value === 'number' ? value.toLocaleString(locale) : value}
          </Text>
          <Flex align="center" gap={3}>
            {isPositive ? (
              <TrendingUp data-part="trend-icon" />
            ) : (
              <TrendingDown data-part="trend-icon" />
            )}
            <Text data-part="change-value">
              {change || '--'}
            </Text>
          </Flex>
        </Flex>
      </Box>

      <ProgressBar progress={progress} height={3} />
    </Box>
  );
}
