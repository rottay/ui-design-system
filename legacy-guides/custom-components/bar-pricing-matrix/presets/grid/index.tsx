'use client';

/**
 * BarPricingMatrix - Grid Preset
 * Matrix grid showing prices across zones
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle } from '../../../helpers';
import type { BarPricingMatrixProps, PriceZone, PriceConfig } from '../../core';

const MOCK_ZONES: PriceZone[] = [
  { id: 'z1', name: 'Main Bar', isActive: true },
  { id: 'z2', name: 'VIP Lounge', isActive: true },
  { id: 'z3', name: 'Rooftop', isActive: true },
  { id: 'z4', name: 'Pool Area', isActive: false },
];

const MOCK_CONFIGS: PriceConfig[] = [
  { id: 'c1', productName: 'Margarita', productCategory: 'Cocktails', basePrice: 14.00, currency: 'USD', zonePrices: { z1: 14.00, z2: 18.00, z3: 16.00, z4: 15.00 }, eventMultiplier: 1.2, happyHourPrice: 10.00, isActive: true },
  { id: 'c2', productName: 'Old Fashioned', productCategory: 'Cocktails', basePrice: 15.00, currency: 'USD', zonePrices: { z1: 15.00, z2: 20.00, z3: 17.00, z4: 16.00 }, eventMultiplier: 1.2, happyHourPrice: 11.00, isActive: true },
  { id: 'c3', productName: 'Corona Extra', productCategory: 'Beer', basePrice: 7.00, currency: 'USD', zonePrices: { z1: 7.00, z2: 10.00, z3: 8.00, z4: 7.50 }, eventMultiplier: 1.3, happyHourPrice: 5.00, isActive: true },
  { id: 'c4', productName: 'Heineken', productCategory: 'Beer', basePrice: 7.50, currency: 'USD', zonePrices: { z1: 7.50, z2: 10.50, z3: 8.50, z4: 8.00 }, isActive: true },
  { id: 'c5', productName: 'Red Bull', productCategory: 'Non-Alcoholic', basePrice: 5.00, currency: 'USD', zonePrices: { z1: 5.00, z2: 7.00, z3: 6.00, z4: 5.50 }, isActive: true },
  { id: 'c6', productName: 'Water', productCategory: 'Non-Alcoholic', basePrice: 3.00, currency: 'USD', zonePrices: { z1: 3.00, z2: 4.00, z3: 3.50, z4: 3.00 }, isActive: true },
];

export const GridBarPricingMatrix = createPreset<BarPricingMatrixProps>({
  name: 'BarPricingMatrix.Grid',
  render: ({ primitives, props, tokens }: PresetContext<BarPricingMatrixProps>) => {
    const { Box, Text } = primitives;
    const { zones: propZones, configs: propConfigs, onConfigSelect, onZoneCreate, onConfigCreate, className, style } = props;

    const zones = propZones && propZones.length > 0 ? propZones : MOCK_ZONES;
    const configs = propConfigs && propConfigs.length > 0 ? propConfigs : MOCK_CONFIGS;
    const activeZones = zones.filter(z => z.isActive);
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>Pricing Matrix</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{configs.length} products across {activeZones.length} zones</Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <button onClick={onZoneCreate} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[700], border: `1px solid ${tokens.colors.neutral[300]}`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>+ Zone</button>
            <button onClick={onConfigCreate} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>+ Product Price</button>
          </div>
        </div>

        <div style={{ ...cardBase, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[100] }}>
                <th style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[600], position: 'sticky' as const, left: 0, backgroundColor: tokens.colors.neutral[100] }}>Product</th>
                <th style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, textAlign: 'center' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[600] }}>Base</th>
                {activeZones.map(zone => (
                  <th key={zone.id} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, textAlign: 'center' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>{zone.name}</th>
                ))}
                <th style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, textAlign: 'center' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.warningScale[700] }}>Event</th>
                <th style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, textAlign: 'center' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[700] }}>Happy Hour</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((config, idx) => (
                <tr key={config.id} onClick={() => onConfigSelect?.(config.id)} style={{ cursor: 'pointer', borderBottom: idx < configs.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none', ...hoverStyle }}>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, position: 'sticky' as const, left: 0, backgroundColor: tokens.colors.common.white }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block' }}>{config.productName}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{config.productCategory}</Text>
                  </td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, textAlign: 'center' as const }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${config.basePrice.toFixed(2)}</Text>
                  </td>
                  {activeZones.map(zone => {
                    const zonePrice = config.zonePrices[zone.id];
                    const diff = zonePrice && zonePrice !== config.basePrice;
                    return (
                      <td key={zone.id} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, textAlign: 'center' as const, backgroundColor: diff ? tokens.colors.primaryScale[50] : 'transparent' }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: diff ? tokens.typography.fontWeight.bold : tokens.typography.fontWeight.normal, color: diff ? tokens.colors.primaryScale[700] : tokens.colors.neutral[700] }}>
                          ${(zonePrice || config.basePrice).toFixed(2)}
                        </Text>
                      </td>
                    );
                  })}
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, textAlign: 'center' as const }}>
                    {config.eventMultiplier ? (
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[700] }}>{config.eventMultiplier}x (${(config.basePrice * config.eventMultiplier).toFixed(2)})</Text>
                    ) : (
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>-</Text>
                    )}
                  </td>
                  <td style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, textAlign: 'center' as const }}>
                    {config.happyHourPrice ? (
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600] }}>${config.happyHourPrice.toFixed(2)}</Text>
                    ) : (
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>-</Text>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
    );
  },
});
