'use client';

import { Button, Card, Avatar } from '@rottay/design-system';

export default function Home() {
  return (
    <div className="max-w-5xl">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Rottay Design System</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          A multi-tenant, multi-engine design system built with React, TypeScript, and modern CSS.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Quick Start</h2>
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm">
          <code>npm install @rottay/design-system</code>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Component Preview</h2>

        <div className="grid gap-8">
          {/* Button Examples */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Button</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
          </Card>

          {/* Avatar Examples */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Avatar</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Avatar size="sm">SM</Avatar>
              <Avatar size="md">MD</Avatar>
              <Avatar size="lg">LG</Avatar>
              <Avatar src="https://i.pravatar.cc/150?img=1" alt="User avatar" />
              <Avatar src="https://i.pravatar.cc/150?img=2" alt="User avatar" />
              <Avatar.Group max={3}>
                <Avatar src="https://i.pravatar.cc/150?img=3" alt="User 1" />
                <Avatar src="https://i.pravatar.cc/150?img=4" alt="User 2" />
                <Avatar src="https://i.pravatar.cc/150?img=5" alt="User 3" />
                <Avatar src="https://i.pravatar.cc/150?img=6" alt="User 4" />
                <Avatar src="https://i.pravatar.cc/150?img=7" alt="User 5" />
              </Avatar.Group>
            </div>
          </Card>

          {/* Card Examples */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Card</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <Card.Header>Card Title</Card.Header>
                <Card.Body>
                  This is the card body content. Cards can contain any content including text, images, and other components.
                </Card.Body>
                <Card.Footer>
                  <Button variant="primary" size="sm">Action</Button>
                </Card.Footer>
              </Card>

              <Card variant="outlined">
                <Card.Header>Outlined Card</Card.Header>
                <Card.Body>
                  This card uses the outlined variant with a subtle border instead of elevation.
                </Card.Body>
              </Card>
            </div>
          </Card>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Engines</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Titan</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Built on Ant Design. Full-featured with comprehensive component library.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Hermes</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Built on DaisyUI/Tailwind. Lightweight and utility-first approach.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-2">Apollo</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Pure HTML/CSS. Headless with maximum accessibility and customization.
            </p>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Features</h2>
        <ul className="grid md:grid-cols-2 gap-4">
          {[
            'Multi-tenant architecture',
            'Three rendering engines',
            'TypeScript-first',
            'CSS Variables theming',
            'Compound components',
            'Full accessibility',
            'Tree-shakeable',
            'SSR compatible',
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              {feature}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
