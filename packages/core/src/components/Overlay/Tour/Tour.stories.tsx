import type { Meta, StoryObj } from '@storybook/react';
import { Tour } from './Tour';
import type { TourProps } from 'antd';
import { Button, Space, Divider, Card, Typography, Input } from 'antd';
import { useRef, useState } from 'react';
import { SearchOutlined, BellOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const meta: Meta<typeof Tour> = {
  title: 'Overlay/Tour',
  component: Tour,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente de tour que guía a los usuarios a través de diferentes partes de la interfaz.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/tour)
- [🎨 API de Props](https://ant.design/components/tour#api)
- [💡 Ejemplos](https://ant.design/components/tour#examples)

## Cuándo usar

- Para introducir nuevas funcionalidades a los usuarios
- Cuando necesitas explicar flujos de trabajo complejos
- Para mejorar la adopción de características importantes
        `,
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['default', 'primary'],
    },
    mask: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tour>;

/**
 * Basic tour component with simple steps.
 * Use for introducing new features or onboarding users.
 */
export const Basic: Story = {
  render: () => {
    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);
    const [open, setOpen] = useState(false);

    const steps: TourProps['steps'] = [
      {
        title: 'Welcome',
        description: 'This is a basic tour to help you get started.',
        target: null,
      },
      {
        title: 'First Feature',
        description: 'Click here to access the first feature.',
        target: () => ref1.current,
      },
      {
        title: 'Second Feature',
        description: 'This button opens the second feature.',
        target: () => ref2.current,
      },
      {
        title: 'Third Feature',
        description: 'And here you can find the third feature.',
        target: () => ref3.current,
      },
    ];

    return (
      <>
        <Space>
          <Button ref={ref1}>Feature 1</Button>
          <Button ref={ref2}>Feature 2</Button>
          <Button ref={ref3}>Feature 3</Button>
        </Space>
        <Divider />
        <Button type="primary" onClick={() => setOpen(true)}>
          Start Tour
        </Button>
        <Tour open={open} onClose={() => setOpen(false)} steps={steps} />
      </>
    );
  },
};

/**
 * Tour with different types: default and primary.
 * Primary type uses brand color for emphasis.
 */
export const Types: Story = {
  render: () => {
    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const [defaultOpen, setDefaultOpen] = useState(false);
    const [primaryOpen, setPrimaryOpen] = useState(false);

    const steps: TourProps['steps'] = [
      {
        title: 'Feature Tour',
        description: 'Let me show you around.',
        target: null,
      },
      {
        title: 'First Step',
        description: 'This is the first feature.',
        target: () => ref1.current,
      },
      {
        title: 'Second Step',
        description: 'This is the second feature.',
        target: () => ref2.current,
      },
    ];

    return (
      <>
        <Space>
          <Button ref={ref1}>Button 1</Button>
          <Button ref={ref2}>Button 2</Button>
        </Space>
        <Divider />
        <Space>
          <Button onClick={() => setDefaultOpen(true)}>Start Default Tour</Button>
          <Button type="primary" onClick={() => setPrimaryOpen(true)}>
            Start Primary Tour
          </Button>
        </Space>
        <Tour open={defaultOpen} onClose={() => setDefaultOpen(false)} steps={steps} />
        <Tour
          open={primaryOpen}
          onClose={() => setPrimaryOpen(false)}
          steps={steps}
          type="primary"
        />
      </>
    );
  },
};

/**
 * Tour without mask overlay.
 * Use when you want less visual prominence or allow interaction.
 */
export const WithoutMask: Story = {
  render: () => {
    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);
    const [open, setOpen] = useState(false);

    const steps: TourProps['steps'] = [
      {
        title: 'No Mask Tour',
        description: 'This tour has no dark overlay, making it less intrusive.',
        target: () => ref1.current,
      },
      {
        title: 'Feature Two',
        description: 'You can still interact with the page during the tour.',
        target: () => ref2.current,
      },
      {
        title: 'Feature Three',
        description: 'Final step of the tour.',
        target: () => ref3.current,
      },
    ];

    return (
      <>
        <Space>
          <Button ref={ref1}>Feature A</Button>
          <Button ref={ref2}>Feature B</Button>
          <Button ref={ref3}>Feature C</Button>
        </Space>
        <Divider />
        <Button type="primary" onClick={() => setOpen(true)}>
          Start Tour (No Mask)
        </Button>
        <Tour open={open} onClose={() => setOpen(false)} steps={steps} mask={false} />
      </>
    );
  },
};

/**
 * Custom mask styling for branded experience.
 * Adjust mask opacity and color to match your design.
 */
export const CustomMask: Story = {
  render: () => {
    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const [open, setOpen] = useState(false);

    const steps: TourProps['steps'] = [
      {
        title: 'Custom Styling',
        description: 'This tour has a custom mask with different color and opacity.',
        target: () => ref1.current,
      },
      {
        title: 'Second Step',
        description: 'Notice the bluish overlay instead of the default dark one.',
        target: () => ref2.current,
      },
    ];

    return (
      <>
        <Space>
          <Button ref={ref1}>First Button</Button>
          <Button ref={ref2}>Second Button</Button>
        </Space>
        <Divider />
        <Button type="primary" onClick={() => setOpen(true)}>
          Start Custom Mask Tour
        </Button>
        <Tour
          open={open}
          onClose={() => setOpen(false)}
          steps={steps}
          mask={{
            style: {
              boxShadow: 'inset 0 0 15px #1890ff',
            },
            color: 'rgba(24, 144, 255, 0.4)',
          }}
        />
      </>
    );
  },
};

/**
 * Tour with custom placement for each step.
 * Control where tooltips appear relative to target elements.
 */
export const CustomPlacements: Story = {
  render: () => {
    const topRef = useRef(null);
    const rightRef = useRef(null);
    const bottomRef = useRef(null);
    const leftRef = useRef(null);
    const [open, setOpen] = useState(false);

    const steps: TourProps['steps'] = [
      {
        title: 'Top Placement',
        description: 'This tooltip appears at the top of the target.',
        target: () => topRef.current,
        placement: 'top',
      },
      {
        title: 'Right Placement',
        description: 'This tooltip appears to the right.',
        target: () => rightRef.current,
        placement: 'right',
      },
      {
        title: 'Bottom Placement',
        description: 'This tooltip appears at the bottom.',
        target: () => bottomRef.current,
        placement: 'bottom',
      },
      {
        title: 'Left Placement',
        description: 'This tooltip appears to the left.',
        target: () => leftRef.current,
        placement: 'left',
      },
    ];

    return (
      <>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 300,
            position: 'relative',
          }}
        >
          <Button
            ref={topRef}
            style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)' }}
          >
            Top
          </Button>
          <Button
            ref={rightRef}
            style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)' }}
          >
            Right
          </Button>
          <Button
            ref={bottomRef}
            style={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            Bottom
          </Button>
          <Button
            ref={leftRef}
            style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)' }}
          >
            Left
          </Button>
        </div>
        <Divider />
        <Button type="primary" onClick={() => setOpen(true)}>
          Start Placement Tour
        </Button>
        <Tour open={open} onClose={() => setOpen(false)} steps={steps} />
      </>
    );
  },
};

/**
 * Tour with rich content including images and formatted text.
 * Use for more detailed explanations or visual guides.
 */
export const RichContent: Story = {
  render: () => {
    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const [open, setOpen] = useState(false);

    const steps: TourProps['steps'] = [
      {
        title: <span style={{ fontSize: 18, fontWeight: 'bold' }}>Welcome to the Platform</span>,
        description: (
          <div>
            <Paragraph>
              We're excited to have you here! This tour will help you discover the key features.
            </Paragraph>
            <ul style={{ paddingLeft: 20 }}>
              <li>Easy to use interface</li>
              <li>Powerful features</li>
              <li>Great performance</li>
            </ul>
          </div>
        ),
        target: null,
      },
      {
        title: 'Search Functionality',
        description: (
          <div>
            <Paragraph>Use the search bar to quickly find what you need.</Paragraph>
            <Paragraph type="secondary" style={{ fontSize: 12 }}>
              Pro tip: Use keyboard shortcut Cmd/Ctrl + K
            </Paragraph>
          </div>
        ),
        target: () => ref1.current,
      },
      {
        title: 'User Settings',
        description: (
          <div>
            <Paragraph>Access your profile and preferences here.</Paragraph>
            <img
              src="https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg"
              alt="Settings"
              style={{ width: '100%', marginTop: 8 }}
            />
          </div>
        ),
        target: () => ref2.current,
      },
    ];

    return (
      <>
        <Space>
          <Input
            ref={ref1}
            prefix={<SearchOutlined />}
            placeholder="Search..."
            style={{ width: 300 }}
          />
          <Button ref={ref2} icon={<SettingOutlined />}>
            Settings
          </Button>
        </Space>
        <Divider />
        <Button type="primary" onClick={() => setOpen(true)}>
          Start Rich Content Tour
        </Button>
        <Tour open={open} onClose={() => setOpen(false)} steps={steps} type="primary" />
      </>
    );
  },
};

/**
 * Indicators to show tour progress.
 * Helps users understand how many steps remain.
 */
export const WithIndicators: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);
    const ref4 = useRef(null);

    const steps: TourProps['steps'] = [
      {
        title: 'Step 1 of 4',
        description: 'First step in our tour.',
        target: () => ref1.current,
      },
      {
        title: 'Step 2 of 4',
        description: 'Second step continues here.',
        target: () => ref2.current,
      },
      {
        title: 'Step 3 of 4',
        description: 'Almost there!',
        target: () => ref3.current,
      },
      {
        title: 'Step 4 of 4',
        description: 'Final step of the tour.',
        target: () => ref4.current,
      },
    ];

    return (
      <>
        <Space>
          <Button ref={ref1}>Step 1</Button>
          <Button ref={ref2}>Step 2</Button>
          <Button ref={ref3}>Step 3</Button>
          <Button ref={ref4}>Step 4</Button>
        </Space>
        <Divider />
        <Button type="primary" onClick={() => setOpen(true)}>
          Start Tour with Progress
        </Button>
        <Tour
          open={open}
          onClose={() => setOpen(false)}
          steps={steps}
          indicatorsRender={(current, total) => (
            <span>
              {current + 1} / {total}
            </span>
          )}
        />
      </>
    );
  },
};

/**
 * Application walkthrough tour.
 * Real-world example of onboarding new users to an app.
 */
export const ApplicationWalkthrough: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const searchRef = useRef(null);
    const notificationsRef = useRef(null);
    const profileRef = useRef(null);
    const settingsRef = useRef(null);

    const steps: TourProps['steps'] = [
      {
        title: 'Welcome to Your Dashboard',
        description:
          "Let's take a quick tour to help you get familiar with the main features of the platform.",
        target: null,
      },
      {
        title: 'Global Search',
        description:
          'Use this search bar to quickly find documents, users, or any content across the platform.',
        target: () => searchRef.current,
      },
      {
        title: 'Stay Updated',
        description: 'Check your notifications here for important updates and messages.',
        target: () => notificationsRef.current,
      },
      {
        title: 'Your Profile',
        description: 'Access your profile, preferences, and account settings from here.',
        target: () => profileRef.current,
      },
      {
        title: 'Settings',
        description:
          'Customize your experience, manage integrations, and configure your workspace.',
        target: () => settingsRef.current,
      },
    ];

    return (
      <>
        <Card>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Input
              ref={searchRef}
              prefix={<SearchOutlined />}
              placeholder="Search anything..."
              style={{ width: 300 }}
            />
            <Space>
              <Button ref={notificationsRef} icon={<BellOutlined />} />
              <Button ref={profileRef} icon={<UserOutlined />} />
              <Button ref={settingsRef} icon={<SettingOutlined />} />
            </Space>
          </Space>
          <Divider />
          <Title level={4}>Dashboard</Title>
          <Paragraph>
            Welcome to your dashboard. Click the button below to start the tour and learn about the
            key features.
          </Paragraph>
        </Card>
        <Divider />
        <Button type="primary" size="large" onClick={() => setOpen(true)}>
          Take the Tour
        </Button>
        <Tour open={open} onClose={() => setOpen(false)} steps={steps} type="primary" />
      </>
    );
  },
};

/**
 * Scrollable content tour.
 * Tour that works with scrolling to reveal elements.
 */
export const ScrollableTour: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);

    const steps: TourProps['steps'] = [
      {
        title: 'Top Section',
        description: 'This is at the top of the page.',
        target: () => ref1.current,
      },
      {
        title: 'Middle Section',
        description: 'This section is in the middle. The page will scroll to show it.',
        target: () => ref2.current,
      },
      {
        title: 'Bottom Section',
        description: 'This is at the bottom of the page.',
        target: () => ref3.current,
      },
    ];

    return (
      <>
        <Button type="primary" onClick={() => setOpen(true)}>
          Start Scrollable Tour
        </Button>
        <Divider />
        <div style={{ height: 300, overflowY: 'auto', border: '1px solid #d9d9d9', padding: 16 }}>
          <Card ref={ref1} style={{ marginBottom: 16 }}>
            <Title level={5}>Top Section</Title>
            <Paragraph>This is the first section at the top.</Paragraph>
          </Card>

          <div style={{ height: 400 }} />

          <Card ref={ref2} style={{ marginBottom: 16 }}>
            <Title level={5}>Middle Section</Title>
            <Paragraph>This is the middle section that requires scrolling.</Paragraph>
          </Card>

          <div style={{ height: 400 }} />

          <Card ref={ref3}>
            <Title level={5}>Bottom Section</Title>
            <Paragraph>This is the bottom section.</Paragraph>
          </Card>
        </div>
        <Tour open={open} onClose={() => setOpen(false)} steps={steps} />
      </>
    );
  },
};

/**
 * Tour with callbacks for tracking progress.
 * Use to monitor user interaction with the tour.
 */
export const WithCallbacks: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);

    const steps: TourProps['steps'] = [
      {
        title: 'First Step',
        description: 'This is the first step.',
        target: () => ref1.current,
      },
      {
        title: 'Second Step',
        description: 'This is the second step.',
        target: () => ref2.current,
      },
      {
        title: 'Third Step',
        description: 'This is the final step.',
        target: () => ref3.current,
      },
    ];

    return (
      <>
        <Space>
          <Button ref={ref1}>Feature 1</Button>
          <Button ref={ref2}>Feature 2</Button>
          <Button ref={ref3}>Feature 3</Button>
        </Space>
        <Divider />
        <Space direction="vertical" size="middle">
          <Button type="primary" onClick={() => setOpen(true)}>
            Start Tour with Callbacks
          </Button>
          <div>
            <strong>Current Step:</strong> {currentStep + 1} of {steps.length}
          </div>
        </Space>
        <Tour
          open={open}
          onClose={() => {
            setOpen(false);
            console.log('Tour closed');
          }}
          onChange={(current) => {
            setCurrentStep(current);
            console.log('Step changed to:', current);
          }}
          onFinish={() => {
            console.log('Tour finished');
            alert('Tour completed! Thank you for taking the tour.');
          }}
          steps={steps}
          current={currentStep}
        />
      </>
    );
  },
};

/**
 * Non-modal tour that allows interaction.
 * Users can interact with the page while the tour is active.
 */
export const NonModal: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [count, setCount] = useState(0);
    const ref1 = useRef(null);
    const ref2 = useRef(null);

    const steps: TourProps['steps'] = [
      {
        title: 'Interactive Tour',
        description: 'You can click the counter button while following this tour.',
        target: () => ref1.current,
      },
      {
        title: 'Tour Controls',
        description: 'Use Next/Previous to navigate through the tour steps.',
        target: () => ref2.current,
      },
    ];

    return (
      <>
        <Space>
          <Button ref={ref1} onClick={() => setCount(count + 1)}>
            Counter: {count}
          </Button>
          <Button ref={ref2}>Other Button</Button>
        </Space>
        <Divider />
        <Button type="primary" onClick={() => setOpen(true)}>
          Start Interactive Tour
        </Button>
        <Tour open={open} onClose={() => setOpen(false)} steps={steps} mask={false} />
      </>
    );
  },
};
