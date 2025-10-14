# BottomSheet

A mobile-first bottom sheet component with snap points, drag-to-dismiss functionality, and theme-aware styling.

## Features

- **Snap Points**: Configurable height stops (default: 30%, 60%, 90% of viewport)
- **Drag to Dismiss**: Drag down from the smallest snap point to close
- **Backdrop Click**: Click outside to close (configurable)
- **Drag Handle**: Visual indicator for dragging
- **Portal Rendering**: Renders outside parent DOM hierarchy
- **Smooth Animations**: CSS transitions for natural movement
- **Touch & Mouse Support**: Works on mobile and desktop
- **Theme-Aware**: Applies theme-specific border radius and colors

## Theme-Specific Styling

| Theme | Top Border Radius | Shadow |
|-------|------------------|--------|
| **Spotify** | 12px | Secondary |
| **Stripe** | 8px | Secondary |
| **Notion** | 3px | Secondary |
| **Linear** | 16px | Secondary |
| **Airbnb** | 8px | Secondary |
| **Slack** | 4px | Secondary |
| **Vercel** | 8px | Secondary |
| **Base** | 8px | Secondary |

## Usage

### Basic Example

```tsx
import { BottomSheet } from '@es-rottay/designsystem-core';
import { useState } from 'react';

function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Sheet</button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="My Bottom Sheet"
      >
        <p>Content goes here...</p>
      </BottomSheet>
    </>
  );
}
```

### Custom Snap Points

```tsx
<BottomSheet
  open={open}
  onClose={() => setOpen(false)}
  snapPoints={[0.25, 0.5, 0.75, 0.95]} // 25%, 50%, 75%, 95%
  initialSnapPointIndex={1} // Start at 50%
  onSnapPointChange={(index) => console.log('Current snap:', index)}
>
  <YourContent />
</BottomSheet>
```

### With Footer Actions

```tsx
<BottomSheet
  open={open}
  onClose={() => setOpen(false)}
  title="Confirmation"
  footer={
    <Space>
      <Button type="primary" onClick={handleConfirm}>
        Confirm
      </Button>
      <Button onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </Space>
  }
>
  <p>Are you sure you want to proceed?</p>
</BottomSheet>
```

### Custom Header

```tsx
<BottomSheet
  open={open}
  onClose={() => setOpen(false)}
  header={
    <div style={{ padding: '12px 0' }}>
      <div style={{ /* drag handle styles */ }} />
      <Space>
        <Title level={4}>Custom Header</Title>
        <Button onClick={() => setOpen(false)}>Done</Button>
      </Space>
    </div>
  }
>
  <YourContent />
</BottomSheet>
```

### Disable Dragging

```tsx
<BottomSheet
  open={open}
  onClose={() => setOpen(false)}
  showDragHandle={false}
  dismissOnDrag={false}
  snapPoints={[0.5]} // Single snap point
>
  <YourContent />
</BottomSheet>
```

### Full Height Sheet

```tsx
<BottomSheet
  open={open}
  onClose={() => setOpen(false)}
  snapPoints={[0.95]} // 95% of viewport
  title="Full Content"
>
  <LongContent />
</BottomSheet>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | **Required.** Controls visibility |
| `onClose` | `() => void` | - | **Required.** Callback when closed |
| `children` | `ReactNode` | - | **Required.** Content to render |
| `snapPoints` | `number[]` | `[0.3, 0.6, 0.9]` | Array of heights as viewport fractions (0-1) |
| `initialSnapPointIndex` | `number` | `0` | Starting snap point index |
| `title` | `string` | - | Header title text |
| `showDragHandle` | `boolean` | `true` | Show the drag handle bar |
| `showBackdrop` | `boolean` | `true` | Show the backdrop overlay |
| `closeOnBackdropClick` | `boolean` | `true` | Close when clicking backdrop |
| `dismissOnDrag` | `boolean` | `true` | Allow drag-to-dismiss |
| `header` | `ReactNode` | - | Custom header (replaces title and handle) |
| `footer` | `ReactNode` | - | Footer content |
| `className` | `string` | `''` | Custom CSS class |
| `style` | `CSSProperties` | `{}` | Custom inline styles |
| `zIndex` | `number` | `1000` | Z-index of the sheet |
| `onSnapPointChange` | `(index: number) => void` | - | Callback when snap point changes |

## Behavior

### Snap Point Logic

- When dragging stops, the sheet snaps to the **closest** snap point based on current height
- If dragged down past 100px from the smallest snap point, the sheet dismisses (if `dismissOnDrag` is true)
- Smooth CSS transitions animate the snapping

### Drag Interaction

1. **Mouse**: Click and drag the header area
2. **Touch**: Touch and drag the header area
3. **Visual Feedback**: Real-time position updates during drag
4. **Release**: Automatically snaps or dismisses

### Accessibility

- Uses `createPortal` for proper DOM hierarchy
- Prevents body scroll when open
- Supports keyboard (close on Escape - to be implemented)
- Proper focus management (to be implemented)

## Mobile Optimization

- **Touch-friendly**: Large drag handle (40px × 4px)
- **Responsive**: Adapts to viewport size
- **Performance**: Hardware-accelerated transforms
- **Smooth**: Native-feeling animations

## Use Cases

- **User Menus**: Profile, settings, account options
- **Content Pickers**: Select items from a list
- **Forms**: Mobile-friendly input forms
- **Confirmations**: Action confirmations with buttons
- **Filters**: Filter options for data views
- **Details**: Show additional information without navigation

## Notes

- Automatically prevents body scroll when open
- Renders to `document.body` using React portals
- Works seamlessly with all 8 design system themes
- Mobile-first but works on desktop too
- Touch events have priority over mouse events on touch devices

## Storybook

See the [Storybook stories](./BottomSheet.stories.tsx) for interactive examples.
