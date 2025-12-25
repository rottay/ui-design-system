# Display Primitives - Quick Reference

## Import & Usage Examples

### Image Component

```tsx
import { Image } from '@es-rottay/designsystem-core';

// Basic
<Image src="/photo.jpg" alt="Photo" width={400} height={300} />

// With styling
<Image
  src="/photo.jpg"
  alt="Photo"
  fit="cover"
  radius="lg"
  loading="lazy"
/>

// With fallback
<Image
  src="/photo.jpg"
  alt="Photo"
  fallbackSrc="/fallback.jpg"
  showSkeleton
  onError={(err) => console.error('Image failed:', err)}
/>

// Custom fallback
<Image src="/broken.jpg" alt="Photo" fallback={
  <div>Image not available</div>
} />
```

### Tag Component

```tsx
import { Tag } from '@es-rottay/designsystem-core';

// Basic
<Tag>Default</Tag>

// Variants
<Tag color="primary">Primary</Tag>
<Tag color="success" variant="outline">Success</Tag>
<Tag color="warning" variant="subtle">Warning</Tag>

// Closable
<Tag closable onClose={() => console.log('closed')}>
  Closable Tag
</Tag>

// With icon
<Tag icon={<StarIcon />} color="primary">
  Featured
</Tag>

// Sizes
<Tag size="sm">Small</Tag>
<Tag size="md">Medium</Tag>
<Tag size="lg">Large</Tag>

// Clickable
<Tag clickable onClick={() => alert('clicked')} color="primary">
  Click me
</Tag>
```

### Tooltip Component

```tsx
import { Tooltip } from '@es-rottay/designsystem-core';

// Basic
<Tooltip content="Helpful information">
  <Button>Hover me</Button>
</Tooltip>

// Placements
<Tooltip content="Top" placement="top">...</Tooltip>
<Tooltip content="Bottom" placement="bottom-start">...</Tooltip>
<Tooltip content="Right" placement="right-end">...</Tooltip>

// Triggers
<Tooltip content="Click" trigger="click">...</Tooltip>
<Tooltip content="Focus" trigger="focus">...</Tooltip>
<Tooltip content="Both" trigger={['hover', 'click']}>...</Tooltip>

// Delays
<Tooltip
  content="Delayed"
  openDelay={500}
  closeDelay={200}
>
  <Button>Delayed tooltip</Button>
</Tooltip>

// Controlled
const [open, setOpen] = useState(false);
<Tooltip
  content="Controlled"
  open={open}
  onOpenChange={setOpen}
>
  <Button>Controlled</Button>
</Tooltip>
```

### Typography Components

```tsx
import { Heading, Text, Paragraph } from '@es-rottay/designsystem-core';

// Headings (h1-h6)
<Heading level="h1" size="3xl" weight="bold">
  Main Title
</Heading>

<Heading level="h2" size="2xl" color="primary">
  Section Title
</Heading>

// Text (inline)
<Text size="lg" color="muted" weight="semibold">
  Important text
</Text>

<Text underline>Underlined</Text>
<Text strikethrough>Strikethrough</Text>
<Text italic>Italic</Text>
<Text monospace>Code text</Text>

// Paragraph (block)
<Paragraph size="md" color="default">
  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
</Paragraph>

// Truncation
<Heading truncate>
  Very long title that will be truncated with ellipsis
</Heading>

<Paragraph lineClamp={3}>
  Long paragraph that will be clamped to 3 lines
</Paragraph>

// Alignment
<Heading align="center">Centered</Heading>
<Text align="right">Right aligned</Text>
<Paragraph align="justify">Justified text</Paragraph>
```

## Props Reference

### Image Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | required | Image URL |
| `alt` | `string` | required | Alt text (accessibility) |
| `width` | `number \| string` | - | Image width |
| `height` | `number \| string` | - | Image height |
| `fit` | `'contain' \| 'cover' \| 'fill' \| 'none' \| 'scale-down'` | `'cover'` | Object fit |
| `loading` | `'eager' \| 'lazy'` | `'lazy'` | Loading strategy |
| `radius` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | `'none'` | Border radius |
| `fallbackSrc` | `string` | - | Fallback image URL |
| `fallback` | `ReactNode` | - | Custom fallback element |
| `showSkeleton` | `boolean` | `true` | Show skeleton while loading |

### Tag Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tag size |
| `variant` | `'solid' \| 'outline' \| 'subtle'` | `'solid'` | Visual variant |
| `color` | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error'` | `'default'` | Semantic color |
| `closable` | `boolean` | `false` | Show close button |
| `onClose` | `() => void` | - | Close callback |
| `icon` | `ReactNode` | - | Icon element |
| `rounded` | `boolean` | `false` | Pill style |
| `clickable` | `boolean` | `false` | Clickable state |
| `onClick` | `() => void` | - | Click callback |

### Tooltip Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `ReactNode` | required | Tooltip content |
| `children` | `ReactElement` | required | Trigger element |
| `placement` | `TooltipPlacement` | `'top'` | Tooltip position |
| `trigger` | `'hover' \| 'click' \| 'focus' \| array` | `'hover'` | Trigger type(s) |
| `arrow` | `boolean` | `true` | Show arrow |
| `openDelay` | `number` | `200` | Open delay (ms) |
| `closeDelay` | `number` | `0` | Close delay (ms) |
| `open` | `boolean` | - | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | - | Open change callback |

### Typography Props

**Heading:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `level` | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6'` | `'h2'` | Semantic level |
| `size` | `TextSize` | - | Visual size (overrides level) |
| `weight` | `'normal' \| 'medium' \| 'semibold' \| 'bold'` | `'bold'` | Font weight |
| `color` | `TextColor` | `'default'` | Text color |
| `truncate` | `boolean` | `false` | Truncate with ellipsis |
| `lineClamp` | `number` | - | Max lines before clamp |

**Text:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl'` | `'md'` | Text size |
| `weight` | `TextWeight` | `'normal'` | Font weight |
| `color` | `TextColor` | `'default'` | Text color |
| `as` | `'span' \| 'p' \| 'div' \| 'label'` | `'span'` | Element type |
| `underline` | `boolean` | `false` | Underline text |
| `strikethrough` | `boolean` | `false` | Strikethrough |
| `italic` | `boolean` | `false` | Italic style |
| `monospace` | `boolean` | `false` | Monospace font |

**Paragraph:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `TextSize` | `'md'` | Text size |
| `weight` | `TextWeight` | `'normal'` | Font weight |
| `color` | `TextColor` | `'default'` | Text color |
| `lineClamp` | `number` | - | Max lines before clamp |

## Engine Support

All components support 3 engines:

```tsx
// Titan (Ant Design) - default
<Image engine="titan" ... />

// Hermes (DaisyUI/Tailwind)
<Tag engine="hermes" ... />

// Apollo (Vanilla CSS)
<Tooltip engine="apollo" ... />
```

## TypeScript Types

```typescript
import type {
  // Image
  ImageProps,
  ImageFit,
  ImageRadius,

  // Tag
  TagProps,
  TagSize,
  TagVariant,
  TagColor,

  // Tooltip
  TooltipProps,
  TooltipPlacement,
  TooltipTriggerType,

  // Typography
  HeadingProps,
  TextProps,
  ParagraphProps,
  HeadingLevel,
  TextSize,
  TextWeight,
  TextAlign,
  TextColor,
} from '@es-rottay/designsystem-core';
```

## Accessibility

All components include built-in accessibility:

- **Image**: Required `alt` text, proper loading states
- **Tag**: `aria-label` on close button, keyboard support
- **Tooltip**: `role="tooltip"`, keyboard navigation
- **Typography**: Semantic HTML (h1-h6, p), proper hierarchy

---

**Last Updated:** December 25, 2024
