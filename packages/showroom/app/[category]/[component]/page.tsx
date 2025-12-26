'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Avatar } from '@rottay/design-system';

// Component demos - add more as needed
const componentDemos: Record<string, React.ReactNode> = {
  button: (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-medium mb-4">Variants</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-medium mb-4">Sizes</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-medium mb-4">States</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Default</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="primary" loading>Loading</Button>
        </div>
      </section>
    </div>
  ),

  avatar: (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-medium mb-4">Sizes</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar size="xs">XS</Avatar>
          <Avatar size="sm">SM</Avatar>
          <Avatar size="md">MD</Avatar>
          <Avatar size="lg">LG</Avatar>
          <Avatar size="xl">XL</Avatar>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-medium mb-4">With Images</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar src="https://i.pravatar.cc/150?img=1" alt="User 1" />
          <Avatar src="https://i.pravatar.cc/150?img=2" alt="User 2" />
          <Avatar src="https://i.pravatar.cc/150?img=3" alt="User 3" />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-medium mb-4">Avatar Group</h3>
        <Avatar.Group max={4}>
          <Avatar src="https://i.pravatar.cc/150?img=10" alt="User 1" />
          <Avatar src="https://i.pravatar.cc/150?img=11" alt="User 2" />
          <Avatar src="https://i.pravatar.cc/150?img=12" alt="User 3" />
          <Avatar src="https://i.pravatar.cc/150?img=13" alt="User 4" />
          <Avatar src="https://i.pravatar.cc/150?img=14" alt="User 5" />
          <Avatar src="https://i.pravatar.cc/150?img=15" alt="User 6" />
        </Avatar.Group>
      </section>

      <section>
        <h3 className="text-lg font-medium mb-4">Shapes</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar shape="circle">AB</Avatar>
          <Avatar shape="square">CD</Avatar>
        </div>
      </section>
    </div>
  ),

  card: (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-medium mb-4">Basic Card</h3>
        <Card className="max-w-md">
          <Card.Header>Card Title</Card.Header>
          <Card.Body>
            <p>This is the card body content. Cards are versatile containers that can hold various types of content.</p>
          </Card.Body>
          <Card.Footer>
            <Button variant="primary" size="sm">Action</Button>
          </Card.Footer>
        </Card>
      </section>

      <section>
        <h3 className="text-lg font-medium mb-4">Variants</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <Card.Header>Elevated Card</Card.Header>
            <Card.Body>Default card with shadow elevation.</Card.Body>
          </Card>
          <Card variant="outlined">
            <Card.Header>Outlined Card</Card.Header>
            <Card.Body>Card with border instead of shadow.</Card.Body>
          </Card>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-medium mb-4">With Image</h3>
        <Card className="max-w-sm">
          <Card.Cover>
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop"
              alt="Mountain landscape"
              className="w-full h-48 object-cover"
            />
          </Card.Cover>
          <Card.Header>Beautiful Mountains</Card.Header>
          <Card.Body>
            Explore the stunning mountain landscapes and natural beauty.
          </Card.Body>
        </Card>
      </section>
    </div>
  ),
};

export default function ComponentPage() {
  const params = useParams();
  const category = params.category as string;
  const component = params.component as string;

  const componentName = component.charAt(0).toUpperCase() + component.slice(1);
  const demo = componentDemos[component];

  return (
    <div className="max-w-5xl">
      <nav className="mb-6">
        <Link
          href={`/${category}`}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600 dark:text-gray-400">{componentName}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{componentName}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Interactive examples and usage documentation for the {componentName} component.
        </p>
      </header>

      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Import</h2>
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm">
          <code>{`import { ${componentName} } from '@rottay/design-system';`}</code>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Examples</h2>
        {demo || (
          <div className="text-center py-12 text-gray-500">
            <p>Demo for {componentName} component coming soon.</p>
            <p className="text-sm mt-2">
              This component is available in the design system but the showroom demo is not yet implemented.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
