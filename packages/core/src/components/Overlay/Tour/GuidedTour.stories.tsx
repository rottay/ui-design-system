import type { Meta, StoryObj } from '@storybook/react';
import { GuidedTour, useGuidedTour } from './GuidedTour';
import { Button, Space, Card, Input, Divider, Typography } from 'antd';
import { useRef } from 'react';
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const meta: Meta<typeof GuidedTour> = {
  title: 'Overlay/Tour/GuidedTour',
  component: GuidedTour,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Tour guiado interactivo que presenta las características de la aplicación paso a paso.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/tour)
- [🎨 API de Props](https://ant.design/components/tour#api)
- [💡 Ejemplos](https://ant.design/components/tour#examples)

## Cuándo usar

- Para onboarding de nuevos usuarios
- Cuando necesitas explicar características complejas
- Para guiar usuarios a través de nuevas funcionalidades
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof GuidedTour>;

export const Basic: Story = {
  render: () => {
    const { open, start, setOpen } = useGuidedTour();
    const searchRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLButtonElement>(null);
    const profileRef = useRef<HTMLButtonElement>(null);

    const steps = [
      {
        title: 'Welcome to the Platform',
        description: 'Let\'s take a quick tour to get you started!',
      },
      {
        title: 'Search',
        description: 'Use the search bar to find anything you need quickly.',
        target: () => searchRef.current,
      },
      {
        title: 'Notifications',
        description: 'Stay updated with your latest notifications here.',
        target: () => notificationRef.current,
      },
      {
        title: 'Profile',
        description: 'Access your profile settings and preferences.',
        target: () => profileRef.current,
      },
    ];

    return (
      <>
        <Space style={{ marginBottom: 16 }}>
          <div ref={searchRef}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search..."
              style={{ width: 300 }}
            />
          </div>
          <Button ref={notificationRef} icon={<BellOutlined />}>
            Notifications
          </Button>
          <Button ref={profileRef} icon={<UserOutlined />}>
            Profile
          </Button>
        </Space>
        <Divider />
        <Button type="primary" onClick={start}>
          Start Tour
        </Button>
        <GuidedTour open={open} onClose={() => setOpen(false)} steps={steps} />
      </>
    );
  },
};

export const AutoStart: Story = {
  render: () => {
    const { open, setOpen } = useGuidedTour();
    const ref1 = useRef<HTMLDivElement>(null);
    const ref2 = useRef<HTMLDivElement>(null);
    const ref3 = useRef<HTMLDivElement>(null);

    const steps = [
      {
        title: 'Feature 1',
        description: 'This is the first feature of our application.',
        target: () => ref1.current,
      },
      {
        title: 'Feature 2',
        description: 'Here you can find the second amazing feature.',
        target: () => ref2.current,
      },
      {
        title: 'Feature 3',
        description: 'And this is our third great feature!',
        target: () => ref3.current,
      },
    ];

    return (
      <>
        <Space direction="vertical" size="large">
          <Card ref={ref1} title="Feature 1">
            This is feature 1 content
          </Card>
          <Card ref={ref2} title="Feature 2">
            This is feature 2 content
          </Card>
          <Card ref={ref3} title="Feature 3">
            This is feature 3 content
          </Card>
        </Space>
        <GuidedTour
          open={open}
          onClose={() => setOpen(false)}
          steps={steps}
          autoStart={true}
        />
      </>
    );
  },
};

export const WithProgress: Story = {
  render: () => {
    const { open, start, setOpen } = useGuidedTour();
    const ref1 = useRef<HTMLButtonElement>(null);
    const ref2 = useRef<HTMLButtonElement>(null);
    const ref3 = useRef<HTMLButtonElement>(null);
    const ref4 = useRef<HTMLButtonElement>(null);

    const steps = [
      {
        title: 'Step 1: Create',
        description: 'Click here to create a new item.',
        target: () => ref1.current,
      },
      {
        title: 'Step 2: Edit',
        description: 'Use this button to edit existing items.',
        target: () => ref2.current,
      },
      {
        title: 'Step 3: Delete',
        description: 'Delete items you no longer need.',
        target: () => ref3.current,
      },
      {
        title: 'Step 4: Settings',
        description: 'Configure your preferences here.',
        target: () => ref4.current,
      },
    ];

    return (
      <>
        <Space>
          <Button ref={ref1} type="primary">
            Create
          </Button>
          <Button ref={ref2}>Edit</Button>
          <Button ref={ref3} danger>
            Delete
          </Button>
          <Button ref={ref4} icon={<SettingOutlined />}>
            Settings
          </Button>
        </Space>
        <Divider />
        <Button onClick={start}>Start Guided Tour</Button>
        <GuidedTour
          open={open}
          onClose={() => setOpen(false)}
          steps={steps}
          showProgress={true}
        />
      </>
    );
  },
};

export const CustomTexts: Story = {
  render: () => {
    const { open, start, setOpen } = useGuidedTour();
    const ref1 = useRef<HTMLDivElement>(null);
    const ref2 = useRef<HTMLDivElement>(null);

    const steps = [
      {
        title: 'Dashboard Overview',
        description: 'This is your main dashboard where you can see all your metrics.',
        target: () => ref1.current,
      },
      {
        title: 'Quick Actions',
        description: 'Access frequently used actions from this panel.',
        target: () => ref2.current,
      },
    ];

    return (
      <>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card ref={ref1} title="Dashboard">
            Your dashboard content here
          </Card>
          <Card ref={ref2} title="Quick Actions">
            Quick action buttons here
          </Card>
        </Space>
        <Divider />
        <Button type="primary" onClick={start}>
          Begin Tutorial
        </Button>
        <GuidedTour
          open={open}
          onClose={() => setOpen(false)}
          steps={steps}
          nextText="Continue"
          prevText="Go Back"
          finishText="Got it!"
          showProgress={true}
        />
      </>
    );
  },
};

export const OnboardingFlow: Story = {
  render: () => {
    const { open, start, setOpen, current } = useGuidedTour();
    const welcomeRef = useRef<HTMLDivElement>(null);
    const setupRef = useRef<HTMLDivElement>(null);
    const exploreRef = useRef<HTMLDivElement>(null);

    const handleComplete = () => {
      console.log('Tour completed!');
      alert('Welcome aboard! You\'re all set to start using the platform.');
    };

    const handleSkip = () => {
      console.log('Tour skipped');
      alert('Tour skipped. You can restart it anytime from settings.');
    };

    const steps = [
      {
        title: 'Welcome!',
        description: (
          <div>
            <Paragraph>
              We're excited to have you here! This quick tour will help you get
              started.
            </Paragraph>
          </div>
        ),
        target: () => welcomeRef.current,
      },
      {
        title: 'Complete Your Setup',
        description: 'Fill in your profile details to personalize your experience.',
        target: () => setupRef.current,
      },
      {
        title: 'Explore Features',
        description: (
          <div>
            <Paragraph>
              Discover all the amazing features we have to offer!
            </Paragraph>
            <Paragraph type="secondary">
              You can always revisit this tour from the help menu.
            </Paragraph>
          </div>
        ),
        target: () => exploreRef.current,
      },
    ];

    return (
      <>
        <Title level={3}>Onboarding Experience</Title>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card ref={welcomeRef}>
            <Title level={4}>Welcome Section</Title>
            <Paragraph>Get started with your journey</Paragraph>
          </Card>
          <Card ref={setupRef}>
            <Title level={4}>Profile Setup</Title>
            <Paragraph>Complete your profile information</Paragraph>
          </Card>
          <Card ref={exploreRef}>
            <Title level={4}>Feature Explorer</Title>
            <Paragraph>Discover what you can do</Paragraph>
          </Card>
        </Space>
        <Divider />
        <Space>
          <Button type="primary" size="large" onClick={start}>
            Start Onboarding
          </Button>
          <Typography.Text type="secondary">
            Current step: {current + 1}
          </Typography.Text>
        </Space>
        <GuidedTour
          open={open}
          onClose={() => setOpen(false)}
          steps={steps}
          onComplete={handleComplete}
          onSkip={handleSkip}
          showProgress={true}
          finishText="Let's Go!"
        />
      </>
    );
  },
};

export const PlacementVariants: Story = {
  render: () => {
    const { open, start, setOpen } = useGuidedTour();
    const topRef = useRef<HTMLButtonElement>(null);
    const rightRef = useRef<HTMLButtonElement>(null);
    const bottomRef = useRef<HTMLButtonElement>(null);
    const leftRef = useRef<HTMLButtonElement>(null);
    const centerRef = useRef<HTMLButtonElement>(null);

    const steps = [
      {
        title: 'Top Placement',
        description: 'This tooltip appears at the top',
        target: () => topRef.current,
        placement: 'top' as const,
      },
      {
        title: 'Right Placement',
        description: 'This tooltip appears on the right',
        target: () => rightRef.current,
        placement: 'right' as const,
      },
      {
        title: 'Bottom Placement',
        description: 'This tooltip appears at the bottom',
        target: () => bottomRef.current,
        placement: 'bottom' as const,
      },
      {
        title: 'Left Placement',
        description: 'This tooltip appears on the left',
        target: () => leftRef.current,
        placement: 'left' as const,
      },
      {
        title: 'Center Placement',
        description: 'This tooltip appears in the center',
        target: () => centerRef.current,
        placement: 'center' as const,
      },
    ];

    return (
      <>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
            position: 'relative',
          }}
        >
          <Button
            ref={topRef}
            style={{ position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%)' }}
          >
            Top
          </Button>
          <Button
            ref={rightRef}
            style={{ position: 'absolute', right: 50, top: '50%', transform: 'translateY(-50%)' }}
          >
            Right
          </Button>
          <Button
            ref={bottomRef}
            style={{ position: 'absolute', bottom: 50, left: '50%', transform: 'translateX(-50%)' }}
          >
            Bottom
          </Button>
          <Button
            ref={leftRef}
            style={{ position: 'absolute', left: 50, top: '50%', transform: 'translateY(-50%)' }}
          >
            Left
          </Button>
          <Button ref={centerRef}>Center</Button>
        </div>
        <Divider />
        <Button type="primary" onClick={start}>
          Show Placement Tour
        </Button>
        <GuidedTour open={open} onClose={() => setOpen(false)} steps={steps} />
      </>
    );
  },
};

export const ComplexContent: Story = {
  render: () => {
    const { open, start, setOpen } = useGuidedTour();
    const ref1 = useRef<HTMLDivElement>(null);
    const ref2 = useRef<HTMLDivElement>(null);

    const steps = [
      {
        title: (
          <Space>
            <SettingOutlined />
            <span>Advanced Configuration</span>
          </Space>
        ),
        description: (
          <div>
            <Paragraph>
              Configure advanced settings for your application:
            </Paragraph>
            <ul>
              <li>API Integration</li>
              <li>Security Settings</li>
              <li>Performance Tuning</li>
            </ul>
          </div>
        ),
        target: () => ref1.current,
      },
      {
        title: 'Analytics Dashboard',
        description: (
          <Card size="small">
            <Paragraph strong>Track your metrics:</Paragraph>
            <Paragraph>
              - User engagement
              <br />
              - Conversion rates
              <br />- Performance indicators
            </Paragraph>
          </Card>
        ),
        target: () => ref2.current,
      },
    ];

    return (
      <>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card ref={ref1} title="Settings">
            Configuration options
          </Card>
          <Card ref={ref2} title="Analytics">
            Data and insights
          </Card>
        </Space>
        <Divider />
        <Button type="primary" onClick={start}>
          Start Complex Tour
        </Button>
        <GuidedTour open={open} onClose={() => setOpen(false)} steps={steps} />
      </>
    );
  },
};
