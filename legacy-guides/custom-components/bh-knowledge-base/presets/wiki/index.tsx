'use client';

/**
 * BhKnowledgeBase - Wiki Preset
 * Full wiki view with category sidebar, article grid/detail,
 * featured articles banner, search, and helpful rating.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  BookOpen,
  FileText,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Eye,
  ThumbsUp,
  ThumbsDown,
  User,
  Clock,
  Tag,
  Star,
  ArrowLeft,
  Hash,
  Sparkles,
  BookMarked,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createBadgeStyle,
  createSurfaceStyle,
  createListItemStyle,
  createEmptyStateStyle,
  createPersonalitySkeletonStyle,
  createPersonalitySectionHeaderStyle,
  createPersonalityAccentBar,
  createEntranceAnimation,
  createPanelHeaderStyle,
  createDividerStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
  clickableProps,
  listProps,
  listItemProps,
  formatDistanceToNow,
  ICON_SIZES,
} from '../../../helpers';
import type { BhKnowledgeBaseProps, WikiArticle, WikiCategory } from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\n/g, ' ')
    .trim();
}

function truncateText(text: string, maxLength: number): string {
  const stripped = stripMarkdown(text);
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength).trimEnd() + '...';
}

function getHelpfulPercent(helpful: number, notHelpful: number): number {
  const total = helpful + notHelpful;
  if (total === 0) return 0;
  return Math.round((helpful / total) * 100);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const WikiBhKnowledgeBase = createPreset<BhKnowledgeBaseProps>(
  'WikiBhKnowledgeBase',
  ({ primitives, props, tokens }: PresetContext<BhKnowledgeBaseProps>) => {
    const { Box, Text, Button, Input } = primitives;

    const {
      data,
      selectedArticle,
      loading = false,
      onSelectArticle,
      onCreateArticle,
      onEditArticle,
      onSearch,
      searchQuery: externalSearchQuery,
      className,
      style,
    } = props;

    const articles = data?.articles ?? [];
    const categories = data?.categories ?? [];
    const featuredArticles = data?.featuredArticles ?? [];
    const recentlyUpdated = data?.recentlyUpdated ?? [];

    const [searchValue, setSearchValue] = useState(externalSearchQuery ?? '');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(categories.map((c) => c.name)));

    const ptypo = getPersonalityTypography(tokens);
    const badgeRadius = getPersonalityBadgeRadius(tokens);
    const cardHover = createCardHoverStyles(tokens);

    // Filter articles
    const filteredArticles = useMemo(() => {
      let result = [...articles];
      if (searchValue) {
        const lower = searchValue.toLowerCase();
        result = result.filter(
          (a) =>
            a.title.toLowerCase().includes(lower) ||
            a.content.toLowerCase().includes(lower) ||
            a.tags.some((t) => t.toLowerCase().includes(lower))
        );
      }
      if (activeCategory) {
        result = result.filter((a) => a.category === activeCategory);
      }
      return result;
    }, [articles, searchValue, activeCategory]);

    const handleSearch = useCallback(
      (value: string) => {
        setSearchValue(value);
        onSearch?.(value);
      },
      [onSearch]
    );

    const toggleCategory = useCallback((name: string) => {
      setExpandedCategories((prev) => {
        const next = new Set(prev);
        if (next.has(name)) next.delete(name);
        else next.add(name);
        return next;
      });
    }, []);

    // ========================================================================
    // SKELETON LOADING
    // ========================================================================

    if (loading) {
      const skelStyle = createPersonalitySkeletonStyle(tokens);
      return (
        <Box className={className} style={{ ...style, display: 'flex', gap: tokens.spacing[4], padding: tokens.spacing[4] }}>
          <Box style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
            <Box style={{ ...skelStyle, height: 40, width: '100%' }} />
            {[1, 2, 3, 4, 5].map((i) => (
              <Box key={i} style={{ ...skelStyle, height: 32, width: '100%' }} />
            ))}
          </Box>
          <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
            <Box style={{ ...skelStyle, height: 120, width: '100%' }} />
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing[3] }}>
              {[1, 2, 3, 4].map((i) => (
                <Box key={i} style={{ ...skelStyle, height: 160, width: '100%' }} />
              ))}
            </Box>
          </Box>
        </Box>
      );
    }

    // ========================================================================
    // ARTICLE DETAIL VIEW
    // ========================================================================

    if (selectedArticle) {
      const helpfulPct = getHelpfulPercent(selectedArticle.helpful, selectedArticle.notHelpful);

      return (
        <Box className={className} style={{ ...style, display: 'flex', gap: tokens.spacing[4] }}>
          {/* Sidebar (always visible) */}
          <Box style={{ width: 260, flexShrink: 0 }}>
            <Box style={{ ...createCardStyle(tokens), position: 'sticky' as const, top: tokens.spacing[4] }}>
              {/* Search */}
              <Box style={{ position: 'relative' as const, marginBottom: tokens.spacing[3] }}>
                <Search size={ICON_SIZES.label} style={{ position: 'absolute' as const, left: tokens.spacing[2], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], pointerEvents: 'none' as const }} />
                <Input value={searchValue} onChange={handleSearch} placeholder="Search articles..." style={{ paddingLeft: tokens.spacing[7], width: '100%', fontSize: tokens.typography.fontSize.sm }} />
              </Box>

              {/* Categories */}
              <Box {...listProps('Article categories')} style={{ display: 'flex', flexDirection: 'column' as const }}>
                <Box
                  style={{ ...createListItemStyle(tokens, { active: !activeCategory }), display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}
                  onClick={() => setActiveCategory(null)}
                  {...clickableProps(() => setActiveCategory(null), 'All articles')}
                >
                  <BookOpen size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[500] }} />
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, flex: 1 }}>All Articles</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{data?.totalArticles ?? articles.length}</Text>
                </Box>
                {categories.map((cat) => (
                  <Box
                    key={cat.name}
                    {...listItemProps()}
                    style={{ ...createListItemStyle(tokens, { active: activeCategory === cat.name }), display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}
                    onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                    {...clickableProps(() => setActiveCategory(activeCategory === cat.name ? null : cat.name), `Filter by ${cat.name}`)}
                  >
                    {activeCategory === cat.name ? (
                      <FolderOpen size={ICON_SIZES.label} style={{ color: tokens.colors.primaryScale[500] }} />
                    ) : (
                      <Folder size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[400] }} />
                    )}
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, flex: 1 }}>{cat.name}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{cat.articleCount}</Text>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Article Detail */}
          <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
            {/* Back + Breadcrumb */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Box
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: tokens.colors.primaryScale[600] }}
                onClick={() => onSelectArticle?.('')}
                {...clickableProps(() => onSelectArticle?.(''), 'Back to articles')}
              >
                <ArrowLeft size={ICON_SIZES.section} />
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.primaryScale[600] }}>Articles</Text>
              </Box>
              <ChevronRight size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[300] }} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{selectedArticle.category}</Text>
              <ChevronRight size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[300] }} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{selectedArticle.title}</Text>
            </Box>

            {/* Article Content Card */}
            <Box style={{ ...createCardStyle(tokens), display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
              {/* Title */}
              <Text style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: ptypo.headingWeight,
                color: tokens.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
                lineHeight: 1.4,
              }}>
                {selectedArticle.title}
              </Text>

              {/* Author info */}
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexWrap: 'wrap' as const }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <User size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[400] }} />
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{selectedArticle.author}</Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <Clock size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[400] }} />
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                    Updated {formatDistanceToNow(selectedArticle.lastUpdatedAt, { addSuffix: true })}
                  </Text>
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <Eye size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[400] }} />
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                    {selectedArticle.viewCount} views
                  </Text>
                </Box>
                <Box style={{ ...createBadgeStyle(tokens, 'primary'), borderRadius: badgeRadius }}>
                  {selectedArticle.category}
                </Box>
              </Box>

              <hr style={createDividerStyle(tokens)} />

              {/* Content body */}
              <Box style={{
                fontSize: tokens.typography.fontSize.md,
                color: tokens.colors.neutral[700],
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap' as const,
              }}>
                <Text>{selectedArticle.content}</Text>
              </Box>

              {/* Tags */}
              {selectedArticle.tags.length > 0 && (
                <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[1], paddingTop: tokens.spacing[2] }}>
                  {selectedArticle.tags.map((tag) => (
                    <Box key={tag} style={{ ...createBadgeStyle(tokens, 'secondary'), borderRadius: badgeRadius, gap: 4 }}>
                      <Tag size={ICON_SIZES.inline} />
                      {tag}
                    </Box>
                  ))}
                </Box>
              )}

              <hr style={createDividerStyle(tokens)} />

              {/* Helpful / Not Helpful */}
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                  Was this article helpful?
                </Text>
                <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                      borderRadius: badgeRadius,
                      border: `1px solid ${tokens.colors.successScale[200]}`,
                      backgroundColor: tokens.colors.successScale[50],
                      color: tokens.colors.successScale[700],
                      cursor: 'pointer',
                      fontSize: tokens.typography.fontSize.sm,
                      transition: `all ${tokens.motion.hover}`,
                    }}
                    {...clickableProps(undefined, 'Mark as helpful')}
                  >
                    <ThumbsUp size={ICON_SIZES.label} />
                    Yes ({selectedArticle.helpful})
                  </Box>
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                      borderRadius: badgeRadius,
                      border: `1px solid ${tokens.colors.errorScale[200]}`,
                      backgroundColor: tokens.colors.errorScale[50],
                      color: tokens.colors.errorScale[700],
                      cursor: 'pointer',
                      fontSize: tokens.typography.fontSize.sm,
                      transition: `all ${tokens.motion.hover}`,
                    }}
                    {...clickableProps(undefined, 'Mark as not helpful')}
                  >
                    <ThumbsDown size={ICON_SIZES.label} />
                    No ({selectedArticle.notHelpful})
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Related Articles */}
            {filteredArticles.length > 0 && (
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                <Text style={createPersonalitySectionHeaderStyle(tokens)}>Related Articles</Text>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                  {filteredArticles
                    .filter((a) => a.id !== selectedArticle.id && a.category === selectedArticle.category)
                    .slice(0, 4)
                    .map((a) => (
                      <Box
                        key={a.id}
                        style={{
                          ...createListItemStyle(tokens),
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[2],
                        }}
                        onClick={() => onSelectArticle?.(a.id)}
                        {...clickableProps(() => onSelectArticle?.(a.id), `Read: ${a.title}`)}
                      >
                        <FileText size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[400] }} />
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], flex: 1 }}>
                          {a.title}
                        </Text>
                        <ChevronRight size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[300] }} />
                      </Box>
                    ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      );
    }

    // ========================================================================
    // EMPTY STATE
    // ========================================================================

    if (!articles.length && !loading) {
      return (
        <Box className={className} style={{ ...style, padding: tokens.spacing[4] }}>
          <Box style={createEmptyStateStyle(tokens)}>
            <BookOpen size={ICON_SIZES.illustration} style={{ color: tokens.colors.neutral[300], marginBottom: tokens.spacing[3] }} />
            <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600], marginBottom: tokens.spacing[1] }}>
              No articles yet
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400], marginBottom: tokens.spacing[4] }}>
              Start building your team's knowledge base
            </Text>
            {onCreateArticle && (
              <Button onClick={onCreateArticle}>
                <Plus size={ICON_SIZES.section} />
                Create First Article
              </Button>
            )}
          </Box>
        </Box>
      );
    }

    // ========================================================================
    // MAIN RENDER - Article List View
    // ========================================================================

    return (
      <Box className={className} style={{ ...style, display: 'flex', gap: tokens.spacing[4] }}>
        {/* Left Sidebar: Categories */}
        <Box style={{ width: 260, flexShrink: 0 }}>
          <Box style={{ ...createCardStyle(tokens), position: 'sticky' as const, top: tokens.spacing[4], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
            {/* Search */}
            <Box style={{ position: 'relative' as const }}>
              <Search size={ICON_SIZES.label} style={{ position: 'absolute' as const, left: tokens.spacing[2], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], pointerEvents: 'none' as const }} />
              <Input value={searchValue} onChange={handleSearch} placeholder="Search articles..." style={{ paddingLeft: tokens.spacing[7], width: '100%', fontSize: tokens.typography.fontSize.sm }} />
            </Box>

            {/* Category tree */}
            <Box {...listProps('Article categories')} style={{ display: 'flex', flexDirection: 'column' as const }}>
              <Box
                style={{ ...createListItemStyle(tokens, { active: !activeCategory }), display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}
                onClick={() => setActiveCategory(null)}
                {...clickableProps(() => setActiveCategory(null), 'All articles')}
              >
                <BookOpen size={ICON_SIZES.label} style={{ color: !activeCategory ? tokens.colors.primaryScale[500] : tokens.colors.neutral[500] }} />
                <Text style={{ fontSize: tokens.typography.fontSize.sm, flex: 1 }}>All Articles</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{data?.totalArticles ?? articles.length}</Text>
              </Box>
              {categories.map((cat) => (
                <Box
                  key={cat.name}
                  {...listItemProps()}
                  style={{ ...createListItemStyle(tokens, { active: activeCategory === cat.name }), display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}
                  onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                  {...clickableProps(() => setActiveCategory(activeCategory === cat.name ? null : cat.name), `Filter by ${cat.name}`)}
                >
                  {activeCategory === cat.name ? (
                    <FolderOpen size={ICON_SIZES.label} style={{ color: tokens.colors.primaryScale[500] }} />
                  ) : (
                    <Folder size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[400] }} />
                  )}
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, flex: 1, color: activeCategory === cat.name ? tokens.colors.primaryScale[700] : tokens.colors.neutral[700] }}>
                    {cat.name}
                  </Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{cat.articleCount}</Text>
                </Box>
              ))}
            </Box>

            {/* Create article button */}
            {onCreateArticle && (
              <Button onClick={onCreateArticle} style={{ width: '100%' }}>
                <Plus size={ICON_SIZES.section} />
                New Article
              </Button>
            )}
          </Box>
        </Box>

        {/* Main Content */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
          {/* Featured Articles Banner */}
          {featuredArticles.length > 0 && !activeCategory && !searchValue && (
            <Box style={{ ...createCardStyle(tokens, { elevation: 'md' }), display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <Sparkles size={ICON_SIZES.section} style={{ color: tokens.colors.warningScale[500] }} />
                <Text style={createPersonalitySectionHeaderStyle(tokens)}>Featured</Text>
              </Box>
              <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(featuredArticles.length, 3)}, 1fr)`, gap: tokens.spacing[3] }}>
                {featuredArticles.slice(0, 3).map((article) => (
                  <Box
                    key={article.id}
                    style={{
                      ...createCardStyle(tokens, { interactive: true }),
                      ...cardHover.base,
                      display: 'flex',
                      flexDirection: 'column' as const,
                      gap: tokens.spacing[2],
                      backgroundColor: tokens.colors.primaryScale[50],
                      borderColor: tokens.colors.primaryScale[100],
                    }}
                    onClick={() => onSelectArticle?.(article.id)}
                    {...clickableProps(() => onSelectArticle?.(article.id), `Read: ${article.title}`)}
                  >
                    <BookMarked size={ICON_SIZES.section} style={{ color: tokens.colors.primaryScale[500] }} />
                    <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                      {article.title}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], lineHeight: 1.5 }}>
                      {truncateText(article.content, 80)}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Article Count + Sort */}
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
              {activeCategory ? ` in ${activeCategory}` : ''}
            </Text>
          </Box>

          {/* Article Card Grid */}
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: tokens.spacing[3] }}>
            {filteredArticles.map((article, index) => {
              const entrance = createEntranceAnimation(tokens, { index });
              const helpfulPct = getHelpfulPercent(article.helpful, article.notHelpful);

              return (
                <Box
                  key={article.id}
                  style={{
                    ...createCardStyle(tokens, { interactive: true }),
                    ...cardHover.base,
                    display: 'flex',
                    flexDirection: 'column' as const,
                    gap: tokens.spacing[2],
                    ...entrance.initial,
                    animation: entrance.transition !== 'none' ? `entrance ${entrance.transition}` : undefined,
                  }}
                  onClick={() => onSelectArticle?.(article.id)}
                  {...clickableProps(() => onSelectArticle?.(article.id), `Read: ${article.title}`)}
                >
                  {/* Category badge */}
                  <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box style={{ ...createBadgeStyle(tokens, 'primary'), borderRadius: badgeRadius }}>
                      {article.category}
                    </Box>
                    {helpfulPct > 0 && (
                      <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ThumbsUp size={ICON_SIZES.inline} style={{ color: tokens.colors.successScale[500] }} />
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.successScale[600] }}>
                          {helpfulPct}%
                        </Text>
                      </Box>
                    )}
                  </Box>

                  {/* Title */}
                  <Text style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    lineHeight: 1.4,
                  }}>
                    {article.title}
                  </Text>

                  {/* Excerpt */}
                  <Text style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[500],
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical' as any,
                    overflow: 'hidden' as const,
                  }}>
                    {truncateText(article.content, 150)}
                  </Text>

                  {/* Footer: author, date, views */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginTop: 'auto', paddingTop: tokens.spacing[2] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={ICON_SIZES.inline} style={{ color: tokens.colors.neutral[400] }} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        {article.author}
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={ICON_SIZES.inline} style={{ color: tokens.colors.neutral[400] }} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        {formatDistanceToNow(article.lastUpdatedAt, { addSuffix: true })}
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Eye size={ICON_SIZES.inline} style={{ color: tokens.colors.neutral[400] }} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        {article.viewCount}
                      </Text>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* No results */}
          {filteredArticles.length === 0 && articles.length > 0 && (
            <Box style={createEmptyStateStyle(tokens)}>
              <Search size={ICON_SIZES.hero} style={{ color: tokens.colors.neutral[300], marginBottom: tokens.spacing[2] }} />
              <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500] }}>
                No articles match your search
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400], marginTop: tokens.spacing[1] }}>
                Try adjusting your search or category filter
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  }
);

WikiBhKnowledgeBase.displayName = 'WikiBhKnowledgeBase';
