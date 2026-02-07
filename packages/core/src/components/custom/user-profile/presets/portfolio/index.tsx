'use client';

/**
 * UserProfile - Portfolio Preset
 * Profile with portfolio grid instead of upload area, prominent stats, reviews
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { UserProfileProps, AvailabilityStatus } from '../../core';

const SOCIAL_ICONS: Record<string, string> = {
  linkedin: 'in',
  instagram: '\u{1F4F7}',
  twitter: '\u{1D54F}',
  github: '\u{2687}',
  dribbble: '\u{25CF}',
  website: '\u{1F310}',
  other: '\u{1F517}',
};

export const PortfolioUserProfile = createPreset<UserProfileProps>({
  name: 'UserProfile.Portfolio',
  render: ({ primitives, props, tokens, engine }: PresetContext<UserProfileProps>) => {
    const { Box, Stack } = primitives;
    const {
      user,
      navItems = [],
      activeNavKey = 'profile',
      onNavSelect,
      tabs = [
        { key: 'work', label: 'Work' },
        { key: 'overview', label: 'Overview' },
        { key: 'jobs', label: 'Jobs' },
        { key: 'reviews', label: 'Reviews' },
        { key: 'services', label: 'Services' },
        { key: 'about', label: 'About' },
      ],
      activeTab: controlledActiveTab,
      onTabChange,
      actions = [],
      onSave,
      onCopy,
      loading,
      className,
      style,
    } = props;

    const AVAILABILITY_CONFIG: Record<AvailabilityStatus, { label: string; dotColor: string }> = {
      available: { label: 'Available', dotColor: tokens.colors.successScale[500] },
      busy: { label: 'Busy', dotColor: tokens.colors.errorScale[500] },
      away: { label: 'Away', dotColor: tokens.colors.warningScale[500] },
      offline: { label: 'Offline', dotColor: tokens.colors.neutral[400] },
    };

    const [internalActiveTab, setInternalActiveTab] = useState('work');
    const activeTab = controlledActiveTab ?? internalActiveTab;

    const handleTabChange = (key: string) => {
      if (controlledActiveTab === undefined) setInternalActiveTab(key);
      onTabChange?.(key);
    };

    const availability = user.availability ? AVAILABILITY_CONFIG[user.availability] : null;

    const defaultNavItems = navItems.length > 0 ? navItems : [
      { key: 'home', label: 'Home', section: '', badge: 'BETA' },
      { key: 'dashboard', label: 'Dashboard', section: '' },
      { key: 'jobs', label: 'Jobs', section: '' },
      { key: 'messages', label: 'Messages', section: '' },
      { key: 'profile', label: 'Profile', section: 'IDENTITY' },
      { key: 'analytics', label: 'Analytics', section: 'IDENTITY' },
      { key: 'discover', label: 'Discover', section: 'LEADS' },
      { key: 'projects', label: 'Projects & invoices', section: 'PROJECTS & PAYMENTS' },
      { key: 'wallet', label: 'Wallet', section: 'PROJECTS & PAYMENTS', badge: '$0.00' },
    ];

    const sections: Array<{ section: string; items: typeof defaultNavItems }> = [];
    let currentSection = '';
    defaultNavItems.forEach((item) => {
      const sec = item.section ?? '';
      if (sec !== currentSection) {
        currentSection = sec;
        sections.push({ section: sec, items: [] });
      }
      sections[sections.length - 1].items.push(item);
    });

    const activeTabContent = tabs.find(t => t.key === activeTab)?.content;

    return (
      <Box className={className} style={{
        boxShadow: tokens.shadows.sm, display: 'flex', height: '100%', backgroundColor: tokens.colors.common.white, ...style }}>
        {/* Left Sidebar */}
        <Box style={{ width: 220, minWidth: 220, height: '100%', backgroundColor: tokens.colors.neutral[50], borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <Box style={{ padding: `${tokens.spacing[4]} ${tokens.spacing[3]}`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              {user.avatar ? (
                <img src={user.avatar} alt="" style={{ width: 28, height: 28, borderRadius: tokens.borderRadius.full }} />
              ) : (
                <span style={{ width: 28, height: 28, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[300], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold }}>{user.name.charAt(0)}</span>
              )}
              <div>
                <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold }}>Independent workspace</div>
                <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{user.name}</div>
              </div>
            </div>
          </Box>
          <Box style={{ flex: 1, padding: tokens.spacing[2] }}>
            {sections.map((sec, si) => (
              <Box key={si} style={{ marginBottom: tokens.spacing[2] }}>
                {sec.section && <div style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[400], textTransform: 'uppercase', letterSpacing: '0.5px', padding: `${tokens.spacing[3]} ${tokens.spacing[3]} ${tokens.spacing[1]}` }}>{sec.section}</div>}
                <Stack direction="vertical" spacing="none">
                  {sec.items.map((item) => {
                    const isActive = item.key === activeNavKey;
                    return (
                      <div key={item.key} onClick={() => onNavSelect?.(item.key)} style={{ padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`, borderRadius: tokens.borderRadius.md, display: 'flex', alignItems: 'center', gap: tokens.spacing[2], cursor: 'pointer', backgroundColor: isActive ? tokens.colors.neutral[200] : 'transparent', color: isActive ? tokens.colors.neutral[900] : tokens.colors.neutral[600], fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal, fontSize: tokens.typography.fontSize.sm }}>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.badge && <span style={{ fontSize: tokens.typography.fontSize.xs, color: typeof item.badge === 'string' && item.badge === 'BETA' ? tokens.colors.secondaryScale[600] : tokens.colors.neutral[500], backgroundColor: typeof item.badge === 'string' && item.badge === 'BETA' ? tokens.colors.secondaryScale[100] : 'transparent', padding: typeof item.badge === 'string' && item.badge === 'BETA' ? `${tokens.spacing[0]} ${tokens.spacing[1]}` : '0', borderRadius: tokens.borderRadius.sm, fontWeight: tokens.typography.fontWeight.semibold }}>{item.badge}</span>}
                      </div>
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Main Content */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box style={{ flex: 1, overflowY: 'auto' }}>
            {/* Hero section */}
            <Box style={{ padding: `${tokens.spacing[6]} ${tokens.spacing[6]}`, maxWidth: 1000 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[5] }}>
                {/* Avatar */}
                <Box style={{ flexShrink: 0 }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} style={{ width: tokens.spacing[12], height: tokens.spacing[12], borderRadius: tokens.borderRadius.full, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: tokens.spacing[12], height: tokens.spacing[12], borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[200], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize['4xl'], fontWeight: tokens.typography.fontWeight.bold }}>{user.name.charAt(0)}</div>
                  )}
                  {availability && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginTop: tokens.spacing[2], justifyContent: 'center' }}>
                      <span style={{ width: tokens.spacing[2], height: tokens.spacing[2], borderRadius: tokens.borderRadius.full, backgroundColor: availability.dotColor }} />
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{availability.label}</span>
                    </div>
                  )}
                </Box>

                {/* Info */}
                <Box style={{ flex: 1 }}>
                  <h1 style={{ fontSize: tokens.typography.fontSize['3xl'], fontWeight: tokens.typography.fontWeight.bold, margin: 0 }}>{user.name}</h1>
                  {user.title && <p style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]} 0 0` }}>{user.title}</p>}

                  {/* Stats - prominent */}
                  {user.stats && user.stats.length > 0 && (
                    <Box style={{ display: 'flex', gap: tokens.spacing[6], marginTop: tokens.spacing[4] }}>
                      {user.stats.map((stat, i) => (
                        <div key={i}>
                          <div style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                            {stat.prefix}{stat.value}
                          </div>
                          <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{stat.label}</div>
                        </div>
                      ))}
                    </Box>
                  )}

                  {/* Actions */}
                  {actions.length > 0 && (
                    <Box style={{ display: 'flex', gap: tokens.spacing[2], marginTop: tokens.spacing[4] }}>
                      {actions.map((action) => (
                        <button key={action.key} onClick={action.onClick} style={{ padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`, borderRadius: tokens.borderRadius.full, border: action.variant === 'primary' ? 'none' : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`, backgroundColor: action.variant === 'primary' ? tokens.colors.neutral[800] : tokens.colors.common.white, color: action.variant === 'primary' ? tokens.colors.common.white : tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer' }}>
                          {action.icon && <span style={{ marginRight: tokens.spacing[1] }}>{action.icon}</span>}
                          {action.label}
                        </button>
                      ))}
                    </Box>
                  )}

                  {/* Location + Social */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], marginTop: tokens.spacing[4] }}>
                    {user.location && <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>📍 {user.location}</span>}
                    {user.socialLinks && user.socialLinks.length > 0 && (
                      <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
                        {user.socialLinks.map((link, i) => (
                          <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{ width: 30, height: 30, borderRadius: tokens.borderRadius.full, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold }}>
                            {link.icon ?? SOCIAL_ICONS[link.platform] ?? SOCIAL_ICONS.other}
                          </a>
                        ))}
                      </div>
                    )}
                  </Box>
                </Box>
              </div>

              {/* Tabs */}
              <Box style={{ marginTop: tokens.spacing[6], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                <div style={{ display: 'flex', gap: 0 }}>
                  {tabs.map((tab) => (
                    <button key={tab.key} onClick={() => handleTabChange(tab.key)} style={{ padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`, border: 'none', borderBottom: tab.key === activeTab ? `2px solid ${tokens.colors.neutral[900]}` : '2px solid transparent', backgroundColor: 'transparent', fontSize: tokens.typography.fontSize.sm, fontWeight: tab.key === activeTab ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal, color: tab.key === activeTab ? tokens.colors.neutral[900] : tokens.colors.neutral[500], cursor: 'pointer' }}>
                      {tab.label}
                      {tab.count !== undefined && <span style={{ marginLeft: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>({tab.count})</span>}
                    </button>
                  ))}
                </div>
              </Box>

              {/* Tab content - portfolio grid or custom */}
              <Box style={{ marginTop: tokens.spacing[5] }}>
                {activeTabContent ?? (
                  <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: tokens.spacing[4] }}>
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <Box key={item} style={{ borderRadius: tokens.borderRadius.xl, overflow: 'hidden', border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, cursor: 'pointer' }}>
                        <Box style={{ height: 180, backgroundColor: tokens.colors.neutral[100], display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                          Portfolio Item {item}
                        </Box>
                        <Box style={{ padding: tokens.spacing[3] }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                            <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.warningScale[500] }}>{'\u{2605}'} 5.0</span>
                            <div style={{ flex: 1, height: 3, backgroundColor: tokens.colors.neutral[200], borderRadius: tokens.borderRadius.sm }}>
                              <div style={{ width: '100%', height: '100%', backgroundColor: tokens.colors.warningScale[500], borderRadius: tokens.borderRadius.sm }} />
                            </div>
                          </div>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Bottom bar */}
          {(onSave || onCopy) && (
            <Box style={{ borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, display: 'flex' }}>
              {onSave && <button onClick={onSave} style={{ flex: 1, padding: tokens.spacing[4], border: 'none', backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[900], fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>Save</button>}
              {onCopy && <button onClick={onCopy} style={{ flex: 1, padding: tokens.spacing[4], border: 'none', backgroundColor: tokens.colors.neutral[800], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>Copy</button>}
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
