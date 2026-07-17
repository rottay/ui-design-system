/**
 * @fileoverview DataTerminalCard — structures-tier dashboard metric card
 * with four animated visual variants.
 *
 * @description
 * Engine-free structures family for dashboard surfaces. Renders a single
 * metric card with a "Terminal / HUD / Circuit / Matrix" visual theme,
 * a trend indicator, an optional sparkline, and an optional href that
 * turns the whole card into a link via the DS navigation adapter.
 * Consumers compose multiple cards into a dashboard grid or drop a
 * single card into a widget slot.
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
import { TrendingUp, TrendingDown, ArrowRight, Eye, Plus, BarChart3, Activity } from 'lucide-react';
import type { ComponentType } from 'react';
type LucideIcon = ComponentType<any>;

/**
 * Internal Link wrapper that resolves the consumer-supplied Link via the
 * NavigationLinkProvider context, falling back to a native `<a>` when no
 * provider is mounted. This keeps the DS pattern framework-agnostic
 * (mirrors the Wave 5.1 follow-up adapter pattern used by SurfaceReadField).
 */
function NavLinkAnchor({ href, style, children }: { href: string; style?: CSSProperties; children: ReactNode }) {
  const NavLink = useNavigationLink();
  if (NavLink) {
    return (
      <NavLink href={href} style={style}>
        {children}
      </NavLink>
    );
  }
  return (
    <a href={href} style={style}>
      {children}
    </a>
  );
}

export interface DataTerminalCardProps {
  label: string;
  value: number | string;
  change?: string;
  trend?: 'up' | 'down';
  icon: LucideIcon;
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

// Live indicator component
function LiveIndicator({ color = DS.success }: { color?: string }) {
  return (
    <Flex align="center" gap={6} style={{ '--ds-dtc-live': color } as CSSProperties}>
      <Box
        style={{
          position: 'relative',
          width: 6,
          height: 6,
        }}
      >
        <Box
          data-part="live-pulse-ring"
          style={{
            position: 'absolute',
            inset: 0,
            animation: 'dtc-live-pulse 2s ease-in-out infinite',
          }}
        />
        <Box
          data-part="live-ring"
          style={{
            position: 'absolute',
            inset: 0,
          }}
        />
      </Box>
      <Text
        data-part="live-label"
        style={{
          fontSize: 9,
          fontFamily: 'monospace',
          letterSpacing: '0.05em',
        }}
      >
        LIVE
      </Text>
    </Flex>
  );
}

// Activity indicator - simulates data activity
// Heights are stable across renders to avoid impure Math.random() during render
const ACTIVITY_BAR_HEIGHTS = [12, 9, 15, 10, 14];

function ActivityIndicator() {
  return (
    <Flex align="center" gap={2}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Box
          key={i}
          data-part="activity-bar"
          style={{
            width: 2,
            height: ACTIVITY_BAR_HEIGHTS[i],
            animation: `dtc-data-tick 1s ease-in-out infinite ${i * 0.15}s`,
          }}
        />
      ))}
    </Flex>
  );
}

// Quick action button
function QuickAction({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <Box
      as="button"
      data-part="quick-action"
      onClick={(e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '5px 10px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <Icon data-part="quick-action-icon" style={{ width: 11, height: 11 }} />
      <Text
        data-part="quick-action-label"
        style={{
          fontSize: 9,
          fontFamily: 'monospace',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </Text>
    </Box>
  );
}

// Progress bar component
function ProgressBar({ progress, height = 4 }: { progress: number; height?: number }) {
  // Radius is `height / 2` — computed from a runtime prop, so it rides a
  // custom-property hatch the track sets and both track + fill read.
  return (
    <Box
      data-part="progress-track"
      style={
        {
          height,
          overflow: 'hidden',
          '--ds-dtc-radius': `${height / 2}px`,
        } as CSSProperties
      }
    >
      <Box
        data-part="progress-fill"
        data-band={progress >= 80 ? 'high' : progress >= 50 ? 'mid' : 'low'}
        style={{
          height: '100%',
          width: `${progress}%`,
          transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Shimmer effect */}
        <Box
          data-part="progress-shimmer"
          style={{
            position: 'absolute',
            inset: 0,
            animation: 'dtc-wave 2s ease-in-out infinite',
          }}
        />
      </Box>
    </Box>
  );
}

// Stats item component for consistent layout
function StatItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box data-part="stat-item" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Text
        data-part="stat-item-label"
        style={{
          fontSize: 9,
          fontFamily: 'monospace',
          letterSpacing: '0.08em',
          display: 'block',
        }}
      >
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
  const isPositive = trend === 'up';

  return (
    <NavLinkAnchor href={path} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <Box
        className="ds-data-terminal-card"
        data-part="root"
        data-variant="1"
        data-trend={trend}
        data-band={progress >= 80 ? 'high' : progress >= 50 ? 'mid' : 'low'}
        style={{
          position: 'relative',
          height: '100%',
          minHeight: 240,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'dtc-fade-in 0.4s ease-out',
        }}
      >
        {/* Terminal header */}
        <Box
          data-part="terminal-bar"
          style={{
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Flex align="center" gap={10}>
            <Flex gap={5}>
              <Box data-part="terminal-dot" style={{ width: 10, height: 10, opacity: 0.8 }} />
              <Box data-part="terminal-dot" style={{ width: 10, height: 10, opacity: 0.8 }} />
              <Box data-part="terminal-dot" style={{ width: 10, height: 10, opacity: 0.8 }} />
            </Flex>
            <Text data-part="terminal-filename" style={{ fontSize: 11, fontFamily: 'monospace' }}>
              {label.toLowerCase().replace(/\s+/g, '_')}.sys
            </Text>
          </Flex>
          <Flex align="center" gap={8}>
            <ActivityIndicator />
            <Box
              data-part="heartbeat-dot"
              style={{
                width: 8,
                height: 8,
                animation: 'dtc-heartbeat 1.5s ease-in-out infinite',
              }}
            />
          </Flex>
        </Box>

        {/* Content */}
        <Box
          style={{
            flex: 1,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Command prompt header */}
          <Box data-part="prompt-header" style={{ paddingBottom: 12, marginBottom: 16 }}>
            <Flex align="center" gap={8}>
              <Text data-part="prompt-symbol" style={{ fontSize: 12, fontFamily: 'monospace' }}>
                $
              </Text>
              <Icon data-part="prompt-icon" style={{ width: 14, height: 14 }} />
              <Text
                data-part="prompt-label"
                style={{
                  fontSize: 12,
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                }}
              >
                {label.toUpperCase()}
              </Text>
              <Box
                data-part="cursor"
                style={{
                  width: 8,
                  height: 2,
                  animation: 'dtc-typing 1s step-end infinite',
                }}
              />
            </Flex>
          </Box>

          {/* Main value section */}
          <Box style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <Text
              data-part="value"
              style={{
                fontSize: 56,
                fontWeight: 900,
                fontFamily: 'monospace',
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Text>
          </Box>

          {/* Stats grid - well segmented */}
          <Box
            data-part="stats-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 16,
              padding: '14px 0',
              marginTop: 12,
            }}
          >
            <StatItem label="CHANGE">
              <Flex align="center" gap={4}>
                {isPositive ? (
                  <TrendingUp data-part="trend-icon" style={{ width: 14, height: 14 }} />
                ) : (
                  <TrendingDown data-part="trend-icon" style={{ width: 14, height: 14 }} />
                )}
                <Text
                  data-part="change-value"
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  {change || '--'}
                </Text>
              </Flex>
            </StatItem>
            <StatItem label="PERIOD">
              <Text data-part="period-value" style={{ fontSize: 12, fontFamily: 'monospace' }}>
                {subtitle || 'This week'}
              </Text>
            </StatItem>
            <StatItem label="TARGET">
              <Text
                data-part="target-value"
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                }}
              >
                {progress}%
              </Text>
            </StatItem>
          </Box>

          {/* Progress bar section */}
          <Box style={{ paddingTop: 12 }}>
            <ProgressBar progress={progress} height={5} />
          </Box>
        </Box>

        {/* Actions footer */}
        <Box data-part="actions-footer" style={{ padding: '10px 14px' }}>
          <Flex gap={8}>
            <QuickAction icon={Eye} label="VIEW" />
            <QuickAction icon={Plus} label="ADD" />
            <QuickAction icon={BarChart3} label="STATS" />
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
  const isPositive = trend === 'up';
  const statusLabel = progress >= 80 ? 'OPTIMAL' : progress >= 50 ? 'MODERATE' : 'ATTENTION';

  return (
    <NavLinkAnchor href={path} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <Box
        className="ds-data-terminal-card"
        data-part="root"
        data-variant="2"
        data-trend={trend}
        data-band={progress >= 80 ? 'high' : progress >= 50 ? 'mid' : 'low'}
        style={{
          position: 'relative',
          height: '100%',
          minHeight: 240,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'dtc-fade-in 0.4s ease-out',
        }}
      >
        {/* Grid texture */}
        <Box
          data-part="grid-texture"
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.25,
            animation: 'dtc-breathe 4s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Scan line */}
        <Box
          data-part="scan-line"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 50,
            animation: 'dtc-scan 5s linear infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Corner brackets */}
        <Box
          data-part="corner-bracket"
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            width: 18,
            height: 18,
            animation: 'dtc-pulse 3s ease-in-out infinite',
          }}
        />
        <Box
          data-part="corner-bracket"
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 18,
            height: 18,
            animation: 'dtc-pulse 3s ease-in-out infinite 0.5s',
          }}
        />
        <Box
          data-part="corner-bracket"
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            width: 18,
            height: 18,
            animation: 'dtc-pulse 3s ease-in-out infinite 1s',
          }}
        />
        <Box
          data-part="corner-bracket"
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            width: 18,
            height: 18,
            animation: 'dtc-pulse 3s ease-in-out infinite 1.5s',
          }}
        />

        {/* Content */}
        <Box
          style={{
            position: 'relative',
            zIndex: 1,
            flex: 1,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header section */}
          <Box data-part="section-divider" style={{ paddingBottom: 14 }}>
            <Flex align="start" justify="between">
              <Flex align="center" gap={12}>
                <Box
                  data-part="header-icon-box"
                  style={{
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon data-part="header-icon" style={{ width: 18, height: 18 }} />
                </Box>
                <Box>
                  <Text
                    data-part="tracking-label"
                    style={{
                      fontSize: 9,
                      fontFamily: 'monospace',
                      letterSpacing: '0.15em',
                      marginBottom: 4,
                      display: 'block',
                    }}
                  >
                    TRACKING
                  </Text>
                  <Text
                    data-part="header-label"
                    style={{
                      fontSize: 13,
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      display: 'block',
                    }}
                  >
                    {label.toUpperCase()}
                  </Text>
                </Box>
              </Flex>
              <Box data-part="status-badge" style={{ padding: '4px 10px' }}>
                <Flex align="center" gap={6}>
                  <Box
                    data-part="status-dot"
                    style={{
                      width: 6,
                      height: 6,
                      animation: 'dtc-heartbeat 1.5s ease-in-out infinite',
                    }}
                  />
                  <Text
                    data-part="status-label"
                    style={{
                      fontSize: 9,
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                    }}
                  >
                    {statusLabel}
                  </Text>
                </Flex>
              </Box>
            </Flex>
          </Box>

          {/* Main value section */}
          <Box
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 0',
            }}
          >
            <Text
              data-part="value"
              style={{
                fontSize: 64,
                fontWeight: 900,
                fontFamily: 'monospace',
                lineHeight: 1,
              }}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Text>
            <Flex align="center" gap={12} style={{ marginTop: 16 }}>
              <Box data-part="trend-badge" style={{ padding: '6px 12px' }}>
                <Flex align="center" gap={6}>
                  {isPositive ? (
                    <TrendingUp data-part="trend-icon" style={{ width: 14, height: 14 }} />
                  ) : (
                    <TrendingDown data-part="trend-icon" style={{ width: 14, height: 14 }} />
                  )}
                  <Text
                    data-part="change-value"
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: 'monospace',
                    }}
                  >
                    {change || '--'}
                  </Text>
                </Flex>
              </Box>
              <Text data-part="period-value" style={{ fontSize: 12, fontFamily: 'monospace' }}>
                {subtitle || 'this period'}
              </Text>
            </Flex>
          </Box>

          {/* Bottom stats section */}
          <Box data-part="stats-panel" style={{ padding: '14px 16px' }}>
            <Flex align="center" justify="between">
              <Box>
                <Text
                  data-part="completion-label"
                  style={{
                    fontSize: 9,
                    fontFamily: 'monospace',
                    letterSpacing: '0.1em',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  COMPLETION
                </Text>
                <Text
                  data-part="completion-value"
                  style={{
                    fontSize: 18,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    display: 'block',
                  }}
                >
                  {progress}%
                </Text>
              </Box>
              <Box style={{ flex: 1, maxWidth: 120, margin: '0 20px' }}>
                <ProgressBar progress={progress} height={6} />
              </Box>
              <Flex align="center" gap={8}>
                <Activity
                  data-part="details-icon"
                  style={{
                    width: 14,
                    height: 14,
                    animation: 'dtc-pulse 1s ease-in-out infinite',
                  }}
                />
                <Text
                  data-part="details-label"
                  style={{
                    fontSize: 11,
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                  }}
                >
                  DETAILS
                </Text>
                <ArrowRight data-part="details-arrow" style={{ width: 12, height: 12 }} />
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
  const isPositive = trend === 'up';
  const progressColor = getProgressColor(progress);

  return (
    <NavLinkAnchor href={path} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <Box
        className="ds-data-terminal-card"
        data-part="root"
        data-variant="3"
        data-trend={trend}
        data-band={progress >= 80 ? 'high' : progress >= 50 ? 'mid' : 'low'}
        style={{
          position: 'relative',
          height: '100%',
          minHeight: 240,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'dtc-fade-in 0.4s ease-out',
        }}
      >
        {/* Circuit pattern */}
        <Box
          data-part="circuit-pattern"
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.12,
            pointerEvents: 'none',
          }}
        />

        {/* Data flow line */}
        <Box
          data-part="flow-line"
          style={{
            position: 'absolute',
            top: '40%',
            left: 0,
            width: 60,
            height: 2,
            animation: 'dtc-slide 4s linear infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Node indicators */}
        <Box
          data-part="node-dot"
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            width: 10,
            height: 10,
            animation: 'dtc-pulse 2s ease-in-out infinite',
          }}
        />
        <Box
          data-part="node-dot-live"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 10,
            height: 10,
            animation: 'dtc-heartbeat 1.5s ease-in-out infinite',
          }}
        />
        <Box
          data-part="node-dot"
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            width: 10,
            height: 10,
            animation: 'dtc-pulse 2s ease-in-out infinite 1s',
          }}
        />
        <Box
          data-part="node-dot"
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            width: 10,
            height: 10,
            animation: 'dtc-pulse 2s ease-in-out infinite 0.5s',
          }}
        />

        {/* Content */}
        <Box
          style={{
            position: 'relative',
            zIndex: 1,
            flex: 1,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header section */}
          <Box data-part="section-divider" style={{ paddingBottom: 12 }}>
            <Flex align="center" justify="between">
              <Flex align="center" gap={10}>
                <Box
                  data-part="header-icon-box"
                  style={{
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon data-part="header-icon" style={{ width: 14, height: 14 }} />
                </Box>
                <Box>
                  <Text
                    data-part="metric-label"
                    style={{
                      fontSize: 9,
                      fontFamily: 'monospace',
                      letterSpacing: '0.1em',
                      display: 'block',
                      marginBottom: 2,
                    }}
                  >
                    METRIC
                  </Text>
                  <Text
                    data-part="header-label"
                    style={{
                      fontSize: 12,
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      display: 'block',
                    }}
                  >
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
          <Box
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              padding: '16px 0',
            }}
          >
            <Text
              data-part="value"
              style={{
                fontSize: 56,
                fontWeight: 900,
                fontFamily: 'monospace',
                lineHeight: 1,
              }}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Text>
          </Box>

          {/* Stats grid section */}
          <Box
            data-part="stats-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 12,
              padding: '12px 0',
            }}
          >
            <StatItem label="CHANGE">
              <Flex align="center" gap={4}>
                {isPositive ? (
                  <TrendingUp data-part="trend-icon" style={{ width: 14, height: 14 }} />
                ) : (
                  <TrendingDown data-part="trend-icon" style={{ width: 14, height: 14 }} />
                )}
                <Text
                  data-part="change-value"
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  {change || '--'}
                </Text>
              </Flex>
            </StatItem>
            <StatItem label="PERIOD">
              <Text data-part="period-value" style={{ fontSize: 12, fontFamily: 'monospace' }}>
                {subtitle || 'This week'}
              </Text>
            </StatItem>
            <StatItem label="TARGET">
              <Text
                data-part="target-value"
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                }}
              >
                {progress}%
              </Text>
            </StatItem>
          </Box>

          {/* Progress section */}
          <Box style={{ padding: '12px 0' }}>
            <ProgressBar progress={progress} height={5} />
          </Box>

          {/* Actions footer */}
          <Flex gap={8}>
            <QuickAction icon={Eye} label="VIEW" />
            <QuickAction icon={BarChart3} label="ANALYTICS" />
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
  const isPositive = trend === 'up';

  return (
    <NavLinkAnchor href={path} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <Box
        className="ds-data-terminal-card"
        data-part="root"
        data-variant="4"
        data-trend={trend}
        data-band={progress >= 80 ? 'high' : progress >= 50 ? 'mid' : 'low'}
        style={{
          position: 'relative',
          height: '100%',
          minHeight: 240,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'dtc-fade-in 0.4s ease-out',
        }}
      >
        {/* Dot matrix texture */}
        <Box
          data-part="matrix-texture"
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.35,
            pointerEvents: 'none',
            animation: 'dtc-flow 40s linear infinite',
          }}
        />

        {/* Content */}
        <Box
          style={{
            position: 'relative',
            zIndex: 1,
            flex: 1,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header section */}
          <Box data-part="section-divider" style={{ paddingBottom: 12 }}>
            <Flex align="center" justify="between">
              <Flex align="center" gap={10}>
                <Box
                  data-part="header-icon-box"
                  style={{
                    width: 30,
                    height: 30,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon data-part="header-icon" style={{ width: 14, height: 14 }} />
                </Box>
                <Box>
                  <Text
                    data-part="datapoint-label"
                    style={{
                      fontSize: 9,
                      fontFamily: 'monospace',
                      letterSpacing: '0.1em',
                      display: 'block',
                      marginBottom: 2,
                    }}
                  >
                    DATA POINT
                  </Text>
                  <Text
                    data-part="header-label"
                    style={{
                      fontSize: 12,
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      display: 'block',
                    }}
                  >
                    {label.toUpperCase()}
                  </Text>
                </Box>
              </Flex>
              <LiveIndicator color={DS.success} />
            </Flex>
          </Box>

          {/* Main value section */}
          <Box
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 0',
            }}
          >
            <Text
              data-part="value"
              style={{
                fontSize: 68,
                fontWeight: 900,
                fontFamily: 'monospace',
                lineHeight: 1,
                letterSpacing: '-0.03em',
              }}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Text>
          </Box>

          {/* Stats grid section */}
          <Box
            data-part="stats-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 12,
              padding: '12px 0',
            }}
          >
            <StatItem label="CHANGE">
              <Flex align="center" gap={4}>
                {isPositive ? (
                  <TrendingUp data-part="trend-icon" style={{ width: 12, height: 12 }} />
                ) : (
                  <TrendingDown data-part="trend-icon" style={{ width: 12, height: 12 }} />
                )}
                <Text
                  data-part="change-value"
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  {change || '--'}
                </Text>
              </Flex>
            </StatItem>
            <StatItem label="PERIOD">
              <Text data-part="period-value" style={{ fontSize: 11, fontFamily: 'monospace' }}>
                {subtitle || 'This week'}
              </Text>
            </StatItem>
            <StatItem label="TARGET">
              <Text
                data-part="target-value"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                }}
              >
                {progress}%
              </Text>
            </StatItem>
          </Box>

          {/* Progress section */}
          <Box data-part="progress-section" style={{ padding: '12px 0' }}>
            <ProgressBar progress={progress} height={4} />
          </Box>

          {/* Footer section */}
          <Flex align="center" justify="between" style={{ paddingTop: 12 }}>
            <ActivityIndicator />
            <Flex align="center" gap={6}>
              <Text
                data-part="details-label"
                style={{
                  fontSize: 10,
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                }}
              >
                VIEW DETAILS
              </Text>
              <ArrowRight data-part="details-arrow" style={{ width: 12, height: 12 }} />
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
  const isPositive = trend === 'up';

  return (
    <Box
      className="ds-data-terminal-stat"
      data-part="root"
      data-trend={trend}
      style={{
        position: 'relative',
        padding: 14,
        height: '100%',
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box data-part="corner-bracket" style={{ position: 'absolute', top: 0, left: 0, width: 10, height: 10 }} />
      <Box
        data-part="corner-bracket"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 10,
          height: 10,
        }}
      />

      <Flex align="center" gap={6} style={{ marginBottom: 6 }}>
        <Icon data-part="stat-icon" style={{ width: 12, height: 12 }} />
        <Text
          data-part="stat-label"
          style={{
            fontSize: 9,
            fontWeight: 600,
            fontFamily: 'monospace',
            letterSpacing: '0.1em',
          }}
        >
          {label.toUpperCase()}
        </Text>
      </Flex>

      <Box style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Flex align="baseline" gap={6}>
          <Text
            data-part="value"
            style={{
              fontSize: 28,
              fontWeight: 800,
              fontFamily: 'monospace',
              lineHeight: 1,
            }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Text>
          <Flex align="center" gap={3}>
            {isPositive ? (
              <TrendingUp data-part="trend-icon" style={{ width: 10, height: 10 }} />
            ) : (
              <TrendingDown data-part="trend-icon" style={{ width: 10, height: 10 }} />
            )}
            <Text data-part="change-value" style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>
              {change || '--'}
            </Text>
          </Flex>
        </Flex>
      </Box>

      <ProgressBar progress={progress} height={3} />
    </Box>
  );
}
