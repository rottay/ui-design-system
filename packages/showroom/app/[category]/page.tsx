'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@rottay/design-system';

const categoryData: Record<string, {
  name: string;
  description: string;
  components: { name: string; description: string }[]
}> = {
  display: {
    name: 'Display',
    description: 'Components for presenting data and content to users.',
    components: [
      { name: 'Avatar', description: 'Display user profile images or initials' },
      { name: 'Badge', description: 'Small status indicators and labels' },
      { name: 'Card', description: 'Container for related content and actions' },
      { name: 'Image', description: 'Responsive images with loading states' },
      { name: 'Tag', description: 'Categorization and labeling elements' },
      { name: 'Tooltip', description: 'Contextual information on hover' },
      { name: 'Typography', description: 'Text styling and hierarchy' },
    ],
  },
  inputs: {
    name: 'Inputs',
    description: 'Form controls and interactive input elements.',
    components: [
      { name: 'Button', description: 'Clickable actions and submissions' },
      { name: 'Input', description: 'Text input fields' },
      { name: 'Select', description: 'Dropdown selection menus' },
      { name: 'Checkbox', description: 'Multiple choice selections' },
      { name: 'Radio', description: 'Single choice selections' },
      { name: 'Switch', description: 'Toggle on/off states' },
    ],
  },
  feedback: {
    name: 'Feedback',
    description: 'Components for providing feedback to users.',
    components: [
      { name: 'Alert', description: 'Important messages and notifications' },
      { name: 'Modal', description: 'Dialog overlays for focused content' },
      { name: 'Progress', description: 'Loading and completion indicators' },
      { name: 'Skeleton', description: 'Loading placeholders' },
      { name: 'Spinner', description: 'Loading spinners and indicators' },
    ],
  },
  layout: {
    name: 'Layout',
    description: 'Structural components for page and content layout.',
    components: [
      { name: 'Box', description: 'Basic layout container' },
      { name: 'Stack', description: 'Vertical or horizontal stacking' },
      { name: 'Grid', description: 'CSS Grid-based layouts' },
      { name: 'Flex', description: 'Flexbox-based layouts' },
      { name: 'Container', description: 'Centered content container' },
      { name: 'Divider', description: 'Visual separation between content' },
    ],
  },
  navigation: {
    name: 'Navigation',
    description: 'Components for navigating between pages and sections.',
    components: [
      { name: 'Tabs', description: 'Tabbed content navigation' },
      { name: 'Breadcrumb', description: 'Hierarchical navigation path' },
      { name: 'Pagination', description: 'Page navigation controls' },
      { name: 'Menu', description: 'Navigation menus and dropdowns' },
      { name: 'Steps', description: 'Multi-step process navigation' },
    ],
  },
  overlay: {
    name: 'Overlay',
    description: 'Components that overlay the main content.',
    components: [
      { name: 'Dropdown', description: 'Dropdown menus and actions' },
      { name: 'Popover', description: 'Floating content containers' },
      { name: 'Drawer', description: 'Slide-out panels' },
      { name: 'Tour', description: 'Guided feature tours' },
    ],
  },
};

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const data = categoryData[category];

  if (!data) {
    return (
      <div className="max-w-5xl">
        <h1 className="text-4xl font-bold mb-4">Category Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400">
          The category &quot;{category}&quot; does not exist.
        </p>
        <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{data.name}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {data.description}
        </p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.components.map((component) => (
          <Link key={component.name} href={`/${category}/${component.name.toLowerCase()}`}>
            <Card className="p-6 h-full hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-lg font-medium mb-2">{component.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {component.description}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
