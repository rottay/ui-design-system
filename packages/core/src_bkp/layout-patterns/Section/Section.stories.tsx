import type { Meta, StoryObj } from '@storybook/react';
import { Section } from './Section';

const meta = {
  title: 'Layout Patterns/Section',
  component: Section,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Vertical padding size',
    },
    background: {
      control: 'color',
      description: 'Background color',
    },
    contained: {
      control: 'boolean',
      description: 'Whether to wrap content in a Container',
    },
    containerSize: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'],
      description: 'Container size (only when contained=true)',
    },
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'md',
    children: (
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ margin: 0, marginBottom: '1rem' }}>Welcome to Our Platform</h1>
        <p style={{ margin: 0, fontSize: '18px', color: '#666', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          Discover amazing features and tools that will help you build better products faster.
        </p>
      </div>
    ),
  },
};

export const AllSizes: Story = {
  render: () => (
    <>
      <Section size="sm" background="#f0f2f5">
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Small Section (sm)</h2>
          <p style={{ margin: 0, color: '#666' }}>3rem (48px) vertical padding</p>
        </div>
      </Section>

      <Section size="md" background="#ffffff">
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Medium Section (md)</h2>
          <p style={{ margin: 0, color: '#666' }}>4rem (64px) vertical padding</p>
        </div>
      </Section>

      <Section size="lg" background="#f0f2f5">
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Large Section (lg)</h2>
          <p style={{ margin: 0, color: '#666' }}>6rem (96px) vertical padding</p>
        </div>
      </Section>
    </>
  ),
};

export const WithBackground: Story = {
  render: () => (
    <>
      <Section size="lg" background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
        <div style={{ textAlign: 'center', color: 'white' }}>
          <h1 style={{ margin: 0, marginBottom: '1rem', fontSize: '48px' }}>Hero Section</h1>
          <p style={{ margin: 0, fontSize: '20px', marginBottom: '2rem' }}>
            Beautiful gradient background with large padding
          </p>
          <button
            style={{
              backgroundColor: 'white',
              color: '#667eea',
              border: 'none',
              padding: '1rem 2rem',
              fontSize: '18px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Get Started
          </button>
        </div>
      </Section>

      <Section size="md" background="#f0f2f5">
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, marginBottom: '1rem' }}>Features</h2>
          <p style={{ margin: 0, color: '#666', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
            Light gray background provides visual separation between sections
          </p>
        </div>
      </Section>

      <Section size="lg" background="#001529">
        <div style={{ textAlign: 'center', color: 'white' }}>
          <h2 style={{ margin: 0, marginBottom: '1rem' }}>Contact Us</h2>
          <p style={{ margin: 0, marginBottom: '2rem' }}>
            Dark background for footer section
          </p>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
            <a href="#" style={{ color: 'white' }}>Twitter</a>
            <a href="#" style={{ color: 'white' }}>GitHub</a>
            <a href="#" style={{ color: 'white' }}>LinkedIn</a>
          </div>
        </div>
      </Section>
    </>
  ),
};

export const Contained: Story = {
  args: {
    size: 'lg',
    contained: true,
    containerSize: 'lg',
    background: '#f0f2f5',
    children: (
      <div>
        <h1 style={{ margin: 0, marginBottom: '2rem' }}>Contained Section</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px' }}>
            <h3 style={{ margin: 0, marginBottom: '1rem' }}>Feature 1</h3>
            <p style={{ margin: 0, color: '#666' }}>
              Content is constrained within a container for better readability
            </p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px' }}>
            <h3 style={{ margin: 0, marginBottom: '1rem' }}>Feature 2</h3>
            <p style={{ margin: 0, color: '#666' }}>
              Container automatically centers the content
            </p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px' }}>
            <h3 style={{ margin: 0, marginBottom: '1rem' }}>Feature 3</h3>
            <p style={{ margin: 0, color: '#666' }}>
              Max width prevents content from being too wide
            </p>
          </div>
        </div>
      </div>
    ),
  },
};

export const ContainedWithSize: Story = {
  render: () => (
    <>
      <Section size="md" contained containerSize="sm" background="#e6f7ff">
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Small Container (sm)</h2>
          <p style={{ margin: 0, color: '#666' }}>768px max-width - good for narrow content</p>
        </div>
      </Section>

      <Section size="md" contained containerSize="md" background="#f6ffed">
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Medium Container (md)</h2>
          <p style={{ margin: 0, color: '#666' }}>1024px max-width - balanced width</p>
        </div>
      </Section>

      <Section size="md" contained containerSize="lg" background="#fff7e6">
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Large Container (lg)</h2>
          <p style={{ margin: 0, color: '#666' }}>1280px max-width - spacious layout</p>
        </div>
      </Section>

      <Section size="md" contained containerSize="xl" background="#fff0f6">
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Extra Large Container (xl)</h2>
          <p style={{ margin: 0, color: '#666' }}>1536px max-width - very wide content</p>
        </div>
      </Section>
    </>
  ),
};

export const LandingPage: Story = {
  render: () => (
    <>
      {/* Hero */}
      <Section size="lg" background="linear-gradient(135deg, #1890ff 0%, #096dd9 100%)">
        <div style={{ textAlign: 'center', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ margin: 0, marginBottom: '1.5rem', fontSize: '56px', fontWeight: 'bold' }}>
            Build Faster. Ship Better.
          </h1>
          <p style={{ margin: 0, fontSize: '20px', marginBottom: '2rem', opacity: 0.9 }}>
            The all-in-one platform for modern development teams. Collaborate, deploy, and scale with confidence.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              style={{
                backgroundColor: 'white',
                color: '#1890ff',
                border: 'none',
                padding: '1rem 2.5rem',
                fontSize: '18px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Start Free Trial
            </button>
            <button
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: '1rem 2.5rem',
                fontSize: '18px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              View Demo
            </button>
          </div>
        </div>
      </Section>

      {/* Features */}
      <Section size="lg" contained containerSize="lg" background="#ffffff">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ margin: 0, marginBottom: '1rem', fontSize: '36px' }}>Why Choose Us</h2>
          <p style={{ margin: 0, color: '#666', fontSize: '18px' }}>
            Everything you need to build and scale your applications
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>⚡</div>
            <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Lightning Fast</h3>
            <p style={{ margin: 0, color: '#666' }}>Optimized for performance and speed</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🔒</div>
            <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Secure by Default</h3>
            <p style={{ margin: 0, color: '#666' }}>Enterprise-grade security built-in</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🚀</div>
            <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>Scale Effortlessly</h3>
            <p style={{ margin: 0, color: '#666' }}>Grow from startup to enterprise</p>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section size="lg" background="#f0f2f5">
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ margin: 0, marginBottom: '1rem', fontSize: '36px' }}>Ready to Get Started?</h2>
          <p style={{ margin: 0, marginBottom: '2rem', color: '#666', fontSize: '18px' }}>
            Join thousands of developers already building with our platform
          </p>
          <button
            style={{
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              padding: '1rem 3rem',
              fontSize: '18px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Create Account
          </button>
        </div>
      </Section>
    </>
  ),
};
