'use client';

/**
 * EvVendorMarketplace - Marketplace Preset
 * Vendor card grid: company name, category, rating stars, price range badge, availability.
 * Category filter pills. Search bar. Rating display. Book vendor button per card.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
} from '../../../helpers';
import type { VendorMarketplaceProps, Vendor } from '../../core';

const MOCK_VENDORS: Vendor[] = [
  {
    id: 'v1',
    companyName: 'Soundwave Pro Audio',
    category: 'Audio Equipment',
    rating: 4.8,
    priceRange: 'premium',
    availability: true,
    bookedEvents: 23,
    contactEmail: 'bookings@soundwavepro.com',
  },
  {
    id: 'v2',
    companyName: 'Gourmet Street Eats',
    category: 'Food & Beverage',
    rating: 4.5,
    priceRange: 'mid',
    availability: true,
    bookedEvents: 45,
    contactEmail: 'events@gourmeteats.com',
  },
  {
    id: 'v3',
    companyName: 'LightShow Productions',
    category: 'Lighting & Effects',
    rating: 4.9,
    priceRange: 'premium',
    availability: false,
    bookedEvents: 67,
  },
  {
    id: 'v4',
    companyName: 'Budget Stage Rentals',
    category: 'Stage & Structures',
    rating: 4.2,
    priceRange: 'budget',
    availability: true,
    bookedEvents: 12,
  },
  {
    id: 'v5',
    companyName: 'VIP Lounge Furnishings',
    category: 'Furniture & Decor',
    rating: 4.7,
    priceRange: 'premium',
    availability: true,
    bookedEvents: 34,
  },
  {
    id: 'v6',
    companyName: 'Festival Security Services',
    category: 'Security',
    rating: 4.6,
    priceRange: 'mid',
    availability: true,
    bookedEvents: 56,
  },
];

const CATEGORIES = [
  'All',
  'Audio Equipment',
  'Food & Beverage',
  'Lighting & Effects',
  'Stage & Structures',
  'Furniture & Decor',
  'Security',
];

const PRICE_RANGE_CONFIG: Record<string, { color: 'success' | 'info' | 'warning'; label: string }> = {
  budget: { color: 'success', label: '$' },
  mid: { color: 'info', label: '$$' },
  premium: { color: 'warning', label: '$$$' },
};

export const MarketplaceEvVendorMarketplace = createPreset<VendorMarketplaceProps>({
  name: 'EvVendorMarketplace.Marketplace',
  render: ({ primitives, props, tokens }: PresetContext<VendorMarketplaceProps>) => {
    const { Box, Text } = primitives;
    const { vendors, onVendorClick, onBookVendor, className, style } = props;

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const data = vendors?.length ? vendors : MOCK_VENDORS;

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [hoveredVendor, setHoveredVendor] = useState<string | null>(null);

    const filteredData = useMemo(() => {
      return data.filter((v) => {
        if (searchTerm && !v.companyName.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        if (categoryFilter !== 'All' && v.category !== categoryFilter) {
          return false;
        }
        return true;
      });
    }, [data, searchTerm, categoryFilter]);

    const availableCount = data.filter((v) => v.availability).length;

    const renderStars = (rating: number) => {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      const stars = [];
      for (let i = 0; i < fullStars; i++) {
        stars.push('⭐');
      }
      if (hasHalfStar) {
        stars.push('⭐');
      }
      return stars.join('');
    };

    return (
      <Box
        className={className}
        style={{
          height: '100%',
          overflow: 'auto',
          backgroundColor: tokens.colors.neutral[50],
          padding: tokens.spacing[5],
          ...style,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: tokens.spacing[4],
          }}
        >
          <div>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                display: 'block',
              }}
            >
              {'🏪'} Vendor Marketplace
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {data.length} vendors {'·'} {availableCount} available {'·'} {filteredData.length} shown
            </Text>
          </div>
        </div>

        {/* Search & Filters */}
        <div
          style={{
            ...cardBase,
            padding: tokens.spacing[3],
            marginBottom: tokens.spacing[4],
          }}
        >
          {/* Search Bar */}
          <div style={{ marginBottom: tokens.spacing[3] }}>
            <div style={{ position: 'relative' as const }}>
              <div
                style={{
                  position: 'absolute' as const,
                  left: tokens.spacing[3],
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: tokens.colors.neutral[400],
                  fontSize: tokens.typography.fontSize.sm,
                }}
              >
                {'🔍'}
              </div>
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[900],
                  backgroundColor: tokens.colors.common.white,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Category Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexWrap: 'wrap' as const }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[600],
              }}
            >
              Category:
            </Text>
            {CATEGORIES.map((cat) => (
              <div
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={createFilterPillStyle(tokens, { active: categoryFilter === cat })}
              >
                {cat}
              </div>
            ))}
          </div>
        </div>

        {/* Vendor Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: tokens.spacing[3],
          }}
        >
          {filteredData.map((vendor) => {
            const isHovered = hoveredVendor === vendor.id;
            const priceConfig = PRICE_RANGE_CONFIG[vendor.priceRange];

            return (
              <div
                key={vendor.id}
                onMouseEnter={() => setHoveredVendor(vendor.id)}
                onMouseLeave={() => setHoveredVendor(null)}
                onClick={() => onVendorClick?.(vendor.id)}
                style={{
                  ...cardBase,
                  padding: tokens.spacing[4],
                  cursor: 'pointer',
                  transform: isHovered ? 'translateY(-4px)' : 'none',
                  boxShadow: isHovered ? tokens.shadows.lg : tokens.shadows.sm,
                  transition: `all ${tokens.motion.hover}`,
                  opacity: vendor.availability ? 1 : 0.6,
                }}
              >
                {/* Availability Badge */}
                <div style={{ marginBottom: tokens.spacing[2] }}>
                  {vendor.availability ? (
                    <span style={createBadgeStyle(tokens, 'success')}>Available</span>
                  ) : (
                    <span style={createBadgeStyle(tokens, 'secondary')}>Unavailable</span>
                  )}
                </div>

                {/* Company Name */}
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                    display: 'block',
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  {vendor.companyName}
                </Text>

                {/* Category */}
                <div style={{ marginBottom: tokens.spacing[2] }}>
                  <span style={createBadgeStyle(tokens, 'info')}>{vendor.category}</span>
                </div>

                {/* Rating */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  <span style={{ fontSize: tokens.typography.fontSize.sm }}>{renderStars(vendor.rating)}</span>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    {vendor.rating.toFixed(1)}
                  </Text>
                </div>

                {/* Price Range */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                    Price Range:
                  </Text>
                  <span style={createBadgeStyle(tokens, priceConfig.color)}>{priceConfig.label}</span>
                </div>

                {/* Stats */}
                <div
                  style={{
                    padding: `${tokens.spacing[2]}px 0`,
                    borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                    marginTop: tokens.spacing[2],
                  }}
                >
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                    {'📅'} {vendor.bookedEvents} events booked
                  </Text>
                </div>

                {/* Book Button */}
                {vendor.availability && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookVendor?.(vendor.id);
                    }}
                    style={{
                      marginTop: tokens.spacing[3],
                      padding: `${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.primaryScale[500],
                      color: tokens.colors.common.white,
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      textAlign: 'center' as const,
                      cursor: 'pointer',
                      ...hoverStyle,
                    }}
                  >
                    Book Vendor
                  </div>
                )}

                {/* Contact */}
                {vendor.contactEmail && (
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[400],
                      display: 'block',
                      marginTop: tokens.spacing[2],
                      textAlign: 'center' as const,
                    }}
                  >
                    {'📧'} {vendor.contactEmail}
                  </Text>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredData.length === 0 && (
          <div
            style={{
              ...cardBase,
              padding: tokens.spacing[8],
              textAlign: 'center' as const,
            }}
          >
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                display: 'block',
                marginBottom: tokens.spacing[2],
              }}
            >
              {'🔍'}
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
              No vendors match your search criteria
            </Text>
          </div>
        )}
      </Box>
    );
  },
});
