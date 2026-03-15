'use client';

import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type { EvTableAnalyticsProps, TableMetric, TableInsight } from '../../core';

const MOCK_TABLES: TableMetric[] = [
  {
    tableId: 'T1',
    tableLabel: 'Table 1',
    zone: 'Main Dining',
    revenue: 1245.50,
    ordersCount: 12,
    avgDwellMinutes: 68,
    turnoverRate: 3.2,
    avgSpendPerGuest: 45.20,
    peakHour: '19:00',
    occupancyPercent: 87,
  },
  {
    tableId: 'T2',
    tableLabel: 'Table 2',
    zone: 'Main Dining',
    revenue: 890.25,
    ordersCount: 9,
    avgDwellMinutes: 72,
    turnoverRate: 2.8,
    avgSpendPerGuest: 42.10,
    peakHour: '20:00',
    occupancyPercent: 75,
  },
  {
    tableId: 'T3',
    tableLabel: 'Table 3',
    zone: 'Main Dining',
    revenue: 1580.75,
    ordersCount: 15,
    avgDwellMinutes: 65,
    turnoverRate: 3.5,
    avgSpendPerGuest: 48.30,
    peakHour: '19:30',
    occupancyPercent: 92,
  },
  {
    tableId: 'T4',
    tableLabel: 'Table 4',
    zone: 'Bar Area',
    revenue: 2145.00,
    ordersCount: 22,
    avgDwellMinutes: 45,
    turnoverRate: 4.2,
    avgSpendPerGuest: 52.80,
    peakHour: '21:00',
    occupancyPercent: 95,
  },
  {
    tableId: 'T5',
    tableLabel: 'Table 5',
    zone: 'Bar Area',
    revenue: 1890.50,
    ordersCount: 18,
    avgDwellMinutes: 50,
    turnoverRate: 3.8,
    avgSpendPerGuest: 49.60,
    peakHour: '20:30',
    occupancyPercent: 88,
  },
  {
    tableId: 'T6',
    tableLabel: 'Table 6',
    zone: 'Bar Area',
    revenue: 1120.25,
    ordersCount: 11,
    avgDwellMinutes: 55,
    turnoverRate: 3.1,
    avgSpendPerGuest: 44.50,
    peakHour: '19:00',
    occupancyPercent: 78,
  },
  {
    tableId: 'T7',
    tableLabel: 'Table 7',
    zone: 'Patio',
    revenue: 675.50,
    ordersCount: 7,
    avgDwellMinutes: 85,
    turnoverRate: 2.2,
    avgSpendPerGuest: 38.90,
    peakHour: '18:30',
    occupancyPercent: 62,
  },
  {
    tableId: 'T8',
    tableLabel: 'Table 8',
    zone: 'Patio',
    revenue: 1340.75,
    ordersCount: 13,
    avgDwellMinutes: 78,
    turnoverRate: 2.9,
    avgSpendPerGuest: 46.70,
    peakHour: '19:00',
    occupancyPercent: 82,
  },
  {
    tableId: 'T9',
    tableLabel: 'Table 9',
    zone: 'Patio',
    revenue: 925.00,
    ordersCount: 9,
    avgDwellMinutes: 82,
    turnoverRate: 2.5,
    avgSpendPerGuest: 41.20,
    peakHour: '18:00',
    occupancyPercent: 70,
  },
  {
    tableId: 'T10',
    tableLabel: 'Table 10',
    zone: 'Main Dining',
    revenue: 1755.25,
    ordersCount: 17,
    avgDwellMinutes: 62,
    turnoverRate: 3.7,
    avgSpendPerGuest: 50.10,
    peakHour: '20:00',
    occupancyPercent: 90,
  },
];

const MOCK_INSIGHTS: TableInsight[] = [
  {
    id: 'ins1',
    type: 'recommendation',
    title: 'Optimize Table 4 Turnover',
    description: 'Table 4 has the highest revenue but could serve 15% more guests with better turnover management.',
    impact: 'high',
    tableId: 'T4',
  },
  {
    id: 'ins2',
    type: 'alert',
    title: 'Low Performance on Table 7',
    description: 'Table 7 consistently underperforms with 38% lower revenue than zone average. Consider relocating or redesigning.',
    impact: 'high',
    tableId: 'T7',
  },
  {
    id: 'ins3',
    type: 'trend',
    title: 'Bar Area Shows Strong Growth',
    description: 'Bar Area tables show 23% revenue increase week-over-week. Consider expanding bar seating capacity.',
    impact: 'medium',
  },
  {
    id: 'ins4',
    type: 'recommendation',
    title: 'Reduce Dwell Time on Patio',
    description: 'Patio tables have 28% longer dwell times than average. Implement service optimizations to increase turnover.',
    impact: 'medium',
  },
  {
    id: 'ins5',
    type: 'trend',
    title: 'Peak Hours Shifting Later',
    description: 'Peak demand moving from 19:00 to 20:30. Adjust staffing schedules accordingly.',
    impact: 'low',
  },
];

export const InsightsEvTableAnalytics = createPreset<EvTableAnalyticsProps>({
  name: 'EVTableAnalytics.Insights',
  render: (ctx: PresetContext<EvTableAnalyticsProps>) => {
    const { primitives, props, tokens } = ctx;
    const { Box, Text } = primitives;

    const tables = props.metrics || MOCK_TABLES;
    const insights = props.insights || MOCK_INSIGHTS;

    const sortedTables = [...tables].sort((a, b) => b.revenue - a.revenue);
    const totalRevenue = tables.reduce((sum, t) => sum + t.revenue, 0);
    const revenuePerTable = totalRevenue / tables.length;
    const avgDwell = tables.reduce((sum, t) => sum + t.avgDwellMinutes, 0) / tables.length;
    const avgTurnover = tables.reduce((sum, t) => sum + t.turnoverRate, 0) / tables.length;
    const avgSpend = tables.reduce((sum, t) => sum + t.avgSpendPerGuest, 0) / tables.length;

    const zones = Array.from(new Set(tables.map((t) => t.zone)));
    const zoneStats = zones.map((zone) => {
      const zoneTables = tables.filter((t) => t.zone === zone);
      return {
        zone,
        revenue: zoneTables.reduce((sum, t) => sum + t.revenue, 0),
        avgOccupancy: zoneTables.reduce((sum, t) => sum + t.occupancyPercent, 0) / zoneTables.length,
        tableCount: zoneTables.length,
      };
    });

    const getImpactColor = (impact: string): 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary' => {
      switch (impact) {
        case 'high':
          return 'error';
        case 'medium':
          return 'warning';
        case 'low':
          return 'info';
        default:
          return 'secondary';
      }
    };

    const getInsightIcon = (type: string) => {
      switch (type) {
        case 'recommendation':
          return '💡';
        case 'alert':
          return '⚠️';
        case 'trend':
          return '📈';
        default:
          return '📊';
      }
    };

    return (
      <Box style={{ padding: tokens.spacing[4] }}>
        <Box style={{ marginBottom: tokens.spacing[6] }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[1],
            }}
          >
            AI-Powered Insights
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
            }}
          >
            Actionable recommendations to optimize table performance
          </Text>
        </Box>

        <Box
          style={{
            ...createCardStyle(tokens),
            marginBottom: tokens.spacing[4],
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[4],
            }}
          >
            Key Insights
          </Text>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
            {insights.map((insight) => (
              <Box
                key={insight.id}
                style={{
                  ...createSurfaceStyle(tokens),
                  padding: tokens.spacing[3],
                  borderLeft: `4px solid ${
                    insight.impact === 'high'
                      ? tokens.colors.errorScale[500]
                      : insight.impact === 'medium'
                      ? tokens.colors.warningScale[500]
                      : tokens.colors.infoScale[500]
                  }`,
                }}
              >
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.lg }}>
                      {getInsightIcon(insight.type)}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {insight.title}
                    </Text>
                  </Box>
                  <Box style={createBadgeStyle(tokens, getImpactColor(insight.impact))}>
                    {insight.impact.toUpperCase()}
                  </Box>
                </Box>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[500],
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  {insight.description}
                </Text>
                <Box
                  style={{
                    display: 'inline-flex',
                    padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
                    backgroundColor: tokens.colors.primaryScale[50],
                    color: tokens.colors.primaryScale[600],
                    borderRadius: tokens.borderRadius.md,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                  }}
                >
                  Take Action →
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[4],
          }}
        >
          <Box style={createCardStyle(tokens)}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}
            >
              Revenue Per Table
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {'$'}{revenuePerTable.toFixed(0)}
            </Text>
          </Box>

          <Box style={createCardStyle(tokens)}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}
            >
              Avg Dwell Time
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {Math.round(avgDwell)} min
            </Text>
          </Box>

          <Box style={createCardStyle(tokens)}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}
            >
              Avg Turnover Rate
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {avgTurnover.toFixed(1)}x
            </Text>
          </Box>

          <Box style={createCardStyle(tokens)}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[1],
              }}
            >
              Avg Spend Per Guest
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {'$'}{avgSpend.toFixed(2)}
            </Text>
          </Box>
        </Box>

        <Box
          style={{
            ...createCardStyle(tokens),
            marginBottom: tokens.spacing[4],
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[4],
            }}
          >
            Revenue Leaderboard
          </Text>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
            {sortedTables.slice(0, 5).map((table, index) => {
              const revenuePercent = (table.revenue / sortedTables[0].revenue) * 100;

              return (
                <Box key={table.tableId} style={{ position: 'relative' }}>
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.lg,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color:
                            index === 0
                              ? tokens.colors.warningScale[500]
                              : tokens.colors.neutral[500],
                        }}
                      >
                        #{index + 1}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.md,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        {table.tableLabel}
                      </Text>
                      <Box style={createBadgeStyle(tokens, 'secondary')}>{table.zone}</Box>
                    </Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {'$'}{table.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </Box>
                  <Box
                    style={{
                      position: 'relative',
                      height: '8px',
                      backgroundColor: tokens.colors.neutral[100],
                      borderRadius: tokens.borderRadius.full,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: `${revenuePercent}%`,
                        backgroundColor:
                          index === 0
                            ? tokens.colors.successScale[600]
                            : tokens.colors.primaryScale[500],
                        borderRadius: tokens.borderRadius.full,
                        transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box style={createCardStyle(tokens)}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[4],
            }}
          >
            Zone Comparison
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: tokens.spacing[3],
              padding: tokens.spacing[2],
              backgroundColor: tokens.colors.neutral[100],
              borderRadius: tokens.borderRadius.md,
              marginBottom: tokens.spacing[2],
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[500],
              }}
            >
              Zone
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[500],
              }}
            >
              Tables
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[500],
              }}
            >
              Revenue
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[500],
              }}
            >
              Avg Occupancy
            </Text>
          </Box>
          {zoneStats.map((zone) => (
            <Box
              key={zone.zone}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: tokens.spacing[3],
                padding: tokens.spacing[3],
                borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[900],
                }}
              >
                {zone.zone}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}
              >
                {zone.tableCount}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[900],
                }}
              >
                {'$'}{zone.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}
              >
                {zone.avgOccupancy.toFixed(0)}%
              </Text>
            </Box>
          ))}
        </Box>
      </Box>
    );
  },
});
