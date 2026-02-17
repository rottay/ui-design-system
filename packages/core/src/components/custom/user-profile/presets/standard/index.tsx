'use client';

/**
 * UserProfile - Standard Preset
 * Contra-style user profile with sidebar, profile info, stats, tabs, and media upload
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { UserProfileProps, AvailabilityStatus } from '../../core';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createSectionHeaderStyle,
} from '../../../helpers';

const SOCIAL_ICONS: Record<string, string> = {
  linkedin: 'in',
  instagram: '\u{1F4F7}',
  twitter: '\u{1D54F}',
  github: '\u{2687}',
  dribbble: '\u{25CF}',
  website: '\u{1F310}',
  other: '\u{1F517}',
};

export const StandardUserProfile = createPreset<UserProfileProps>({
  name: 'UserProfile.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<UserProfileProps>) => {
    const { Box, Stack } = primitives;
    const {
      user,
      navItems: rawNavItems = [],
      activeNavKey = 'profile',
      onNavSelect,
      tabs = [
        { key: 'overview', label: 'Overview' },
        { key: 'work', label: 'Work' },
        { key: 'jobs', label: 'Jobs' },
        { key: 'reviews', label: 'Reviews' },
        { key: 'services', label: 'Services' },
        { key: 'about', label: 'About' },
      ],
      activeTab: controlledActiveTab,
      onTabChange,
      mediaUpload,
      actions: rawActions = [],
      onSave,
      onCopy,
      editable,
      loading,
      className,
      style,
    } = props;

    const navItems = Array.isArray(rawNavItems) ? rawNavItems : [];
    const actions = Array.isArray(rawActions) ? rawActions : [];

    const AVAILABILITY_CONFIG: Record<AvailabilityStatus, { label: string; color: string; dotColor: string }> = {
      available: { label: 'Available', color: tokens.colors.successScale[500], dotColor: tokens.colors.successScale[500] },
      busy: { label: 'Busy', color: tokens.colors.errorScale[500], dotColor: tokens.colors.errorScale[500] },
      away: { label: 'Away', color: tokens.colors.warningScale[500], dotColor: tokens.colors.warningScale[500] },
      offline: { label: 'Offline', color: tokens.colors.neutral[400], dotColor: tokens.colors.neutral[400] },
    };

    const [internalActiveTab, setInternalActiveTab] = useState('overview');
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

    // Group nav items by section
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
        boxShadow: tokens.shadows.md, display: 'flex', height: '100%', backgroundColor: tokens.colors.common.white, ...style }}>
        {/* Left Sidebar */}
        <Box style={{ width: 220, minWidth: 220, height: '100%', backgroundColor: tokens.colors.neutral[50], borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {/* Workspace header */}
          <Box style={{ padding: `${tokens.spacing[4]} ${tokens.spacing[3]}`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              {user.avatar ? (
                <img src={user.avatar} alt="" style={{ width: 28, height: 28, borderRadius: tokens.borderRadius.full }} />
              ) : (
                <span style={{ width: 28, height: 28, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[300], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold }}>{user.name.charAt(0)}</span>
              )}
              <div>
                <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>Independent workspace</div>
                <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{user.name}</div>
              </div>
              <span style={{ marginLeft: 'auto', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.xs }}>{'>'}</span>
            </div>
          </Box>

          {/* Nav items */}
          <Box style={{ flex: 1, padding: `${tokens.spacing[2]} ${tokens.spacing[2]}` }}>
            {sections.map((sec, si) => (
              <Box key={si} style={{ marginBottom: tokens.spacing[2] }}>
                {sec.section && (
                  <div style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[400], textTransform: 'uppercase', letterSpacing: '0.5px', padding: `${tokens.spacing[3]} ${tokens.spacing[3]} ${tokens.spacing[1]}` }}>{sec.section}</div>
                )}
                <Stack direction="vertical" spacing="none">
                  {sec.items.map((item) => {
                    const isActive = item.key === activeNavKey;
                    return (
                      <div key={item.key} onClick={() => onNavSelect?.(item.key)} onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = tokens.colors.neutral[100];
          e.currentTarget.style.transform = tokens.motion.transform; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isActive ? tokens.colors.neutral[200] : 'transparent';
          e.currentTarget.style.transform = 'none'; }} style={{ padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`, borderRadius: tokens.borderRadius.md, display: 'flex', alignItems: 'center', gap: tokens.spacing[2], cursor: 'pointer', backgroundColor: isActive ? tokens.colors.neutral[200] : 'transparent', color: isActive ? tokens.colors.neutral[900] : tokens.colors.neutral[600], fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal, fontSize: tokens.typography.fontSize.sm, transition: `all ${tokens.motion.hover}` }}>
                        {item.icon && <span>{item.icon}</span>}
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.badge && (
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: typeof item.badge === 'string' && item.badge === 'BETA' ? tokens.colors.secondaryScale[600] : tokens.colors.neutral[500], backgroundColor: typeof item.badge === 'string' && item.badge === 'BETA' ? tokens.colors.secondaryScale[100] : 'transparent', padding: typeof item.badge === 'string' && item.badge === 'BETA' ? `${tokens.spacing[0]} ${tokens.spacing[1]}` : '0', borderRadius: tokens.borderRadius.sm, fontWeight: tokens.typography.fontWeight.semibold }}>{item.badge}</span>
                        )}
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
          {/* Top bar */}
          <Box style={{ padding: `${tokens.spacing[2]} ${tokens.spacing[5]}`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: tokens.spacing[3] }}>
            <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>contra</span>
          </Box>

          {/* Scrollable content */}
          <Box style={{ flex: 1, overflowY: 'auto' }}>
            <Box style={{ display: 'flex', gap: tokens.spacing[6], padding: `${tokens.spacing[6]} ${tokens.spacing[6]}`, maxWidth: 1200 }}>
              {/* Left: Profile info */}
              <Box style={{ flex: '0 0 340px', minWidth: 0 }}>
                {/* Availability */}
                {availability && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], marginBottom: tokens.spacing[3] }}>
                    <span style={{ color: availability.color, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium }}>{availability.label}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ width: tokens.spacing[2], height: tokens.spacing[2], borderRadius: tokens.borderRadius.full, backgroundColor: availability.dotColor }} />
                    </span>
                  </div>
                )}

                {/* Avatar */}
                <Box style={{ marginBottom: tokens.spacing[3] }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} style={{ width: tokens.spacing[10], height: tokens.spacing[10], borderRadius: tokens.borderRadius.full, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: tokens.spacing[10], height: tokens.spacing[10], borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[200], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[600] }}>{user.name.charAt(0)}</div>
                  )}
                </Box>

                {/* Name */}
                <h1 style={{ fontSize: tokens.typography.fontSize['3xl'], fontWeight: tokens.typography.fontWeight.bold, margin: 0, color: tokens.colors.neutral[900] }}>{user.name}</h1>

                {/* Title / Bio */}
                {user.title && (
                  <p style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]} 0 0`, lineHeight: tokens.typography.lineHeight.relaxed }}>{user.title}</p>
                )}

                {/* Action buttons */}
                {actions.length > 0 && (
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginTop: tokens.spacing[4] }}>
                    {actions.map((action) => (
                      <button key={action.key} onClick={action.onClick} onMouseEnter={(e) => { if (action.variant === 'toggle') { e.currentTarget.style.backgroundColor = action.active ? tokens.colors.neutral[900] : tokens.colors.neutral[300];
          e.currentTarget.style.transform = tokens.motion.transform; } else { e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
          e.currentTarget.style.transform = tokens.motion.transform; } }} onMouseLeave={(e) => { if (action.variant === 'toggle') { e.currentTarget.style.backgroundColor = action.active ? tokens.colors.neutral[800] : tokens.colors.neutral[200];
          e.currentTarget.style.transform = 'none'; } else { e.currentTarget.style.backgroundColor = tokens.colors.common.white;
          e.currentTarget.style.transform = 'none'; } }} style={{ padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`, borderRadius: tokens.borderRadius.full, border: action.variant === 'toggle' ? 'none' : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`, backgroundColor: action.variant === 'toggle' ? (action.active ? tokens.colors.neutral[800] : tokens.colors.neutral[200]) : tokens.colors.common.white, color: action.variant === 'toggle' ? (action.active ? tokens.colors.common.white : tokens.colors.neutral[700]) : tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: tokens.spacing[1], transition: `all ${tokens.motion.hover}` }}>
                        {action.icon && <span>{action.icon}</span>}
                        {action.label}
                      </button>
                    ))}
                  </Box>
                )}

                {/* Stats */}
                {user.stats && user.stats.length > 0 && (
                  <Box style={{ marginTop: tokens.spacing[4], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, borderRadius: tokens.borderRadius.lg, padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`, display: 'flex', gap: tokens.spacing[4], boxShadow: tokens.shadows.sm }}>
                    {user.stats.map((stat, i) => (
                      <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                          {stat.prefix && <span style={{ fontSize: tokens.typography.fontSize.sm }}>{stat.prefix}</span>}
                          {stat.value}
                        </div>
                        <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[0] }}>{stat.label}</div>
                      </div>
                    ))}
                  </Box>
                )}

                {/* Tabs */}
                <Box style={{ marginTop: tokens.spacing[5], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                  <div style={{ display: 'flex', gap: 0 }}>
                    {tabs.map((tab) => (
                      <button key={tab.key} onClick={() => handleTabChange(tab.key)} onMouseEnter={(e) => { if (tab.key !== activeTab) e.currentTarget.style.color = tokens.colors.neutral[700];
          e.currentTarget.style.transform = tokens.motion.transform; }} onMouseLeave={(e) => { e.currentTarget.style.color = tab.key === activeTab ? tokens.colors.neutral[900] : tokens.colors.neutral[500];
          e.currentTarget.style.transform = 'none'; }} style={{ padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`, border: 'none', borderBottom: tab.key === activeTab ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[900]}` : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} transparent`, backgroundColor: 'transparent', fontSize: tokens.typography.fontSize.sm, fontWeight: tab.key === activeTab ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal, color: tab.key === activeTab ? tokens.colors.neutral[900] : tokens.colors.neutral[500], cursor: 'pointer', transition: `all ${tokens.motion.hover}` }}>{tab.label}</button>
                    ))}
                  </div>
                </Box>

                {/* Tab content */}
                <Box style={{ marginTop: tokens.spacing[4] }}>
                  {activeTabContent ?? (
                    <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                      No content for this tab yet
                    </Box>
                  )}
                </Box>

                {/* Location + Social links */}
                <Box style={{ marginTop: tokens.spacing[5], display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {user.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                      📍 {user.location}
                    </span>
                  )}
                  {user.socialLinks && user.socialLinks.length > 0 && (
                    <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
                      {user.socialLinks.map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.colors.neutral[100]; e.currentTarget.style.borderColor = tokens.colors.primaryScale[300];
          e.currentTarget.style.transform = tokens.motion.transform; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = tokens.colors.neutral[300];
          e.currentTarget.style.transform = 'none'; }} style={{ width: tokens.spacing[7], height: tokens.spacing[7], borderRadius: tokens.borderRadius.full, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, transition: `all ${tokens.motion.hover}` }}>
                          {link.icon ?? SOCIAL_ICONS[link.platform] ?? SOCIAL_ICONS.other}
                        </a>
                      ))}
                    </div>
                  )}
                </Box>
              </Box>

              {/* Right: Media upload area */}
              <Box style={{ flex: 1, minWidth: 0 }}>
                {mediaUpload ? (
                  <Box style={{ border: `2px dashed ${tokens.colors.primaryScale[300]}`, borderRadius: tokens.borderRadius.xl, backgroundColor: tokens.colors.primaryScale[50], padding: tokens.spacing[8], display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center' }}>
                    {/* Placeholder icons */}
                    <Box style={{ display: 'flex', gap: tokens.spacing[3], marginBottom: tokens.spacing[4], opacity: 0.4 }}>
                      <div style={{ width: 60, height: 60, borderRadius: tokens.borderRadius.lg, backgroundColor: tokens.colors.primaryScale[200], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}` }} />
                      <div style={{ width: 70, height: 70, borderRadius: tokens.borderRadius.lg, backgroundColor: tokens.colors.primaryScale[200], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}`, marginTop: -10 }} />
                      <div style={{ width: 60, height: 60, borderRadius: tokens.borderRadius.lg, backgroundColor: tokens.colors.primaryScale[200], border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}` }} />
                    </Box>
                    <p style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.primaryScale[600], margin: 0 }}>
                      Drag and drop media, or <button onClick={mediaUpload.onBrowse} style={{ background: 'none', border: 'none', color: tokens.colors.primaryScale[600], textDecoration: 'underline', cursor: 'pointer', fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, padding: 0 }}>browse</button>
                    </p>
                    <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[2]} 0 0`, maxWidth: 360 }}>
                      Choose an image (png, jpg, gif) or video (mp4) in a {mediaUpload.aspectRatios?.join(', ') ?? '4:3, 4:5, 9:16, or 16:9'} aspect ratio.
                    </p>
                    <p style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], margin: `${tokens.spacing[2]} 0 0` }}>
                      {mediaUpload.minDimensions ?? 'Min 1600 x 1200'}. {mediaUpload.maxSize ?? 'Max 10MB (images), 20MB (videos)'}.
                    </p>
                  </Box>
                ) : (
                  <Box style={{ border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, borderRadius: tokens.borderRadius.xl, backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[8], display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, color: tokens.colors.neutral[400] }}>
                    No media content
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Bottom fixed bar */}
          {(onSave || onCopy) && (
            <Box style={{ borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, display: 'flex', padding: 0 }}>
              {onSave && (
                <button onClick={onSave} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.colors.neutral[50]; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = tokens.colors.common.white; }} style={{ flex: 1, padding: `${tokens.spacing[4]}`, border: 'none', backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[900], fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, transition: `all ${tokens.motion.hover}` }}>Save</button>
              )}
              {onCopy && (
                <button onClick={onCopy} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.colors.neutral[900];
          e.currentTarget.style.transform = tokens.motion.transform; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = tokens.colors.neutral[800];
          e.currentTarget.style.transform = 'none'; }} style={{ flex: 1, padding: `${tokens.spacing[4]}`, border: 'none', backgroundColor: tokens.colors.neutral[800], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', transition: `all ${tokens.motion.hover}` }}>Copy</button>
              )}
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
