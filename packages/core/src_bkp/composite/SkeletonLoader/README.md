# SkeletonLoader Component

A flexible, theme-aware skeleton loading component with multiple predefined variants and animated shimmer effects.

## Features

- **6 Predefined Variants**: text, paragraph, card, table, profile, custom
- **Theme-Aware**: Automatically adapts border radius based on active theme
- **Multiple Sizes**: small, default, large
- **Animated Shimmer**: Built-in loading animation
- **Configurable Count**: Render multiple skeletons at once
- **Customizable**: Full control over rows, columns, and styling

## Variants

### 1. Text
Single line of text placeholder
```tsx
<SkeletonLoader variant="text" />
<SkeletonLoader variant="text" size="large" />
```

### 2. Paragraph
Multiple lines of text
```tsx
<SkeletonLoader variant="paragraph" rows={4} />
<SkeletonLoader variant="paragraph" size="small" rows={2} />
```

### 3. Card
Card layout with image and text
```tsx
<SkeletonLoader variant="card" />
<SkeletonLoader variant="card" size="large" />
```

### 4. Table
Table with header and rows
```tsx
<SkeletonLoader variant="table" rows={5} columns={4} />
<SkeletonLoader variant="table" rows={3} columns={6} size="small" />
```

### 5. Profile
Avatar with name and subtitle
```tsx
<SkeletonLoader variant="profile" />
<SkeletonLoader variant="profile" size="large" />
```

### 6. Custom
Provide your own skeleton structure
```tsx
<SkeletonLoader variant="custom">
  <Skeleton.Avatar size={80} />
  <Skeleton.Input style={{ width: 200 }} />
</SkeletonLoader>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'text' \| 'paragraph' \| 'card' \| 'table' \| 'profile' \| 'custom'` | `'text'` | Predefined skeleton variant |
| count | `number` | `1` | Number of skeleton items to render |
| size | `'small' \| 'default' \| 'large'` | `'default'` | Size of the skeleton |
| active | `boolean` | `true` | Show animated shimmer effect |
| rows | `number` | `3` | Number of rows (paragraph/table variants) |
| columns | `number` | `4` | Number of columns (table variant) |
| children | `React.ReactNode` | - | Custom children for 'custom' variant |
| className | `string` | - | Additional CSS class |
| style | `React.CSSProperties` | - | Additional inline styles |

## Theme-Specific Behavior

The SkeletonLoader automatically adapts its border radius based on the active theme:

- **Spotify**: 8px
- **Stripe**: 6px
- **Notion**: 3px (square)
- **Linear**: 12px (rounded)
- **Airbnb**: 8px
- **Slack**: 4px
- **Vercel**: 8px
- **Base**: 6px

## Examples

### Loading Multiple Items
```tsx
<SkeletonLoader variant="profile" count={5} />
```

### Loading State with Conditional Rendering
```tsx
{loading ? (
  <SkeletonLoader variant="card" count={3} />
) : (
  <div>{data.map(item => <Card {...item} />)}</div>
)}
```

### Custom Table Loading
```tsx
<SkeletonLoader
  variant="table"
  rows={10}
  columns={6}
  size="small"
/>
```

### Large Profile Cards
```tsx
<SkeletonLoader
  variant="profile"
  size="large"
  count={4}
/>
```

## Size Configurations

### Small
- Avatar: 32px
- Spacing: 8px
- Paragraph rows: 2

### Default
- Avatar: 40px
- Spacing: 12px
- Paragraph rows: 3

### Large
- Avatar: 64px
- Spacing: 16px
- Paragraph rows: 4
