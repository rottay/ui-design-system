# Compound Components Usage Guide

## Overview

After restructuring, several primitive components now have compound subcomponents that can be accessed via dot notation (e.g., `Avatar.Group`, `Button.Icon`, `Card.Header`).

## Available Compound Components

### 1. Avatar Compound Components

#### Avatar.Group
Groups multiple avatars with overlap effect.

```tsx
import { Avatar } from '@rottay/design-system';

<Avatar.Group max={3}>
  <Avatar src="/user1.jpg" alt="User 1" />
  <Avatar src="/user2.jpg" alt="User 2" />
  <Avatar src="/user3.jpg" alt="User 3" />
  <Avatar src="/user4.jpg" alt="User 4" />
  {/* Shows +1 more indicator */}
</Avatar.Group>
```

**Props:**
- `max?: number` - Maximum avatars to show, rest shown as "+N"
- `maxStyle?: CSSProperties` - Custom styles for surplus indicator
- `className?: string`
- `style?: CSSProperties`

#### Avatar.Badge
Adds a status badge to an avatar.

```tsx
import { Avatar } from '@rottay/design-system';

<Avatar.Badge status="online">
  <Avatar src="/user.jpg" alt="User" />
</Avatar.Badge>
```

**Props:**
- `status?: 'online' | 'offline' | 'busy' | 'away'` - Badge color (default: 'online')
- `dot?: boolean` - Show as small dot (default: true)
- `className?: string`
- `style?: CSSProperties`

#### Avatar.Fallback
Shows fallback content when image fails to load.

```tsx
import { Avatar } from '@rottay/design-system';

<Avatar.Fallback
  src="/broken-image.jpg"
  alt="User"
  fallback={<div>JD</div>}
/>
```

**Props:**
- `src?: string` - Image source
- `alt?: string` - Alt text
- `fallback: ReactNode` - Content to show on error
- `className?: string`
- `style?: CSSProperties`

### 2. Button Compound Components

#### Button.Group
Groups multiple buttons with consistent spacing.

```tsx
import { Button } from '@rottay/design-system';

<Button.Group orientation="horizontal" spacing={12}>
  <Button variant="primary">Save</Button>
  <Button variant="secondary">Cancel</Button>
  <Button variant="ghost">Delete</Button>
</Button.Group>
```

**Props:**
- `orientation?: 'horizontal' | 'vertical'` - Group direction (default: 'horizontal')
- `spacing?: number` - Gap between buttons in pixels (default: 8)
- `className?: string`
- `style?: CSSProperties`

#### Button.Icon
Icon-only button variant (requires aria-label for accessibility).

```tsx
import { Button } from '@rottay/design-system';
import { Search } from 'lucide-react';

<Button.Icon
  icon={<Search size={20} />}
  onClick={() => console.log('Search clicked')}
  aria-label="Search"
  variant="primary"
  size="md"
/>
```

**Props:**
- `icon: ReactNode` - Icon to display (required)
- `onClick?: () => void` - Click handler
- `size?: 'sm' | 'md' | 'lg'` - Button size (default: 'md')
- `variant?: 'default' | 'primary' | 'ghost' | 'danger'` - Button style
- `aria-label: string` - Required for accessibility
- `className?: string`
- `style?: CSSProperties`

### 3. Card Compound Components

#### Card.Header
Header section with title, subtitle, and extra content.

```tsx
import { Card } from '@rottay/design-system';

<Card>
  <Card.Header
    title="Card Title"
    subtitle="Optional subtitle"
    extra={<Button>Action</Button>}
  />
  <Card.Body>
    Content here...
  </Card.Body>
</Card>
```

**Props:**
- `title?: string` - Header title
- `subtitle?: string` - Optional subtitle
- `extra?: ReactNode` - Extra content on the right
- `children?: ReactNode` - Custom header content
- `className?: string`
- `style?: CSSProperties`

#### Card.Body
Main content area of the card.

```tsx
import { Card } from '@rottay/design-system';

<Card>
  <Card.Body>
    <p>Your main content goes here</p>
  </Card.Body>
</Card>
```

**Props:**
- `children: ReactNode` - Body content (required)
- `className?: string`
- `style?: CSSProperties`

#### Card.Footer
Footer section with actions or additional content.

```tsx
import { Card } from '@rottay/design-system';

<Card>
  <Card.Body>Content</Card.Body>
  <Card.Footer>
    <Button.Group>
      <Button>Cancel</Button>
      <Button variant="primary">Submit</Button>
    </Button.Group>
  </Card.Footer>
</Card>
```

**Props:**
- `children: ReactNode` - Footer content (required)
- `className?: string`
- `style?: CSSProperties`

## Complete Examples

### User Profile Card

```tsx
import { Card, Avatar, Button } from '@rottay/design-system';

function UserProfileCard() {
  return (
    <Card>
      <Card.Header
        title="User Profile"
        extra={<Button variant="ghost">Edit</Button>}
      />
      <Card.Body>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar.Badge status="online">
            <Avatar src="/profile.jpg" alt="John Doe" size="lg" />
          </Avatar.Badge>
          <div>
            <h3>John Doe</h3>
            <p>Software Engineer</p>
          </div>
        </div>
      </Card.Body>
      <Card.Footer>
        <Button.Group>
          <Button.Icon icon={<MessageIcon />} aria-label="Message" />
          <Button.Icon icon={<CallIcon />} aria-label="Call" />
          <Button variant="primary">Follow</Button>
        </Button.Group>
      </Card.Footer>
    </Card>
  );
}
```

### Team Members List

```tsx
import { Card, Avatar } from '@rottay/design-system';

function TeamMembers() {
  return (
    <Card>
      <Card.Header title="Team Members" subtitle="5 active members" />
      <Card.Body>
        <Avatar.Group max={4}>
          <Avatar src="/member1.jpg" alt="Alice" />
          <Avatar src="/member2.jpg" alt="Bob" />
          <Avatar src="/member3.jpg" alt="Charlie" />
          <Avatar src="/member4.jpg" alt="David" />
          <Avatar src="/member5.jpg" alt="Eve" />
        </Avatar.Group>
      </Card.Body>
    </Card>
  );
}
```

### Action Toolbar

```tsx
import { Button } from '@rottay/design-system';
import { Save, Download, Share, Delete } from 'lucide-react';

function Toolbar() {
  return (
    <Button.Group spacing={8}>
      <Button.Icon icon={<Save />} aria-label="Save" variant="primary" />
      <Button.Icon icon={<Download />} aria-label="Download" />
      <Button.Icon icon={<Share />} aria-label="Share" />
      <Button.Icon icon={<Delete />} aria-label="Delete" variant="danger" />
    </Button.Group>
  );
}
```

## CSS Variables

Compound components use CSS variables for theming:

```css
/* Avatar */
--avatar-group-border: #fff;
--avatar-surplus-bg: #f0f0f0;
--avatar-surplus-color: #666;
--avatar-badge-border: #fff;

/* Button */
--button-radius: 8px;
--button-border: #d9d9d9;

/* Card */
--card-header-padding: 16px 24px;
--card-body-padding: 24px;
--card-footer-padding: 16px 24px;
--card-border-color: #f0f0f0;
--card-title-size: 16px;
--card-title-color: #000;
--card-subtitle-size: 14px;
--card-subtitle-color: #666;
```

## TypeScript Support

All compound components are fully typed:

```tsx
import type {
  AvatarGroupProps,
  AvatarBadgeProps,
  AvatarFallbackProps,
  ButtonGroupProps,
  ButtonIconProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
} from '@rottay/design-system';
```

## Accessibility

- All `Button.Icon` components require `aria-label` for screen readers
- `Avatar.Badge` includes `aria-label` for status
- `Button.Group` uses `role="group"` for semantic grouping
- All interactive elements support keyboard navigation

---

*Last updated: December 25, 2024*
