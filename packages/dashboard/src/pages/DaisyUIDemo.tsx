import React from 'react';
import { DaisyButton, DaisyCard, DaisyBadge, DaisyAlert } from '@es-rottay/designsystem-core';

export const DaisyUIDemo: React.FC = () => {
  return (
    <div style={{ padding: '48px', maxWidth: '1200px' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>
        DaisyUI Components
      </h1>
      <p style={{ fontSize: '16px', color: '#666', marginBottom: '48px' }}>
        Componentes basados en DaisyUI con Tailwind CSS. Estos componentes usan clases utilitarias
        en lugar de Ant Design, ofreciendo un estilo moderno y minimalista.
      </p>

      {/* Buttons Section */}
      <section style={{ marginBottom: '64px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>Buttons</h2>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '16px' }}>Variants</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <DaisyButton variant="primary">Primary</DaisyButton>
            <DaisyButton variant="secondary">Secondary</DaisyButton>
            <DaisyButton variant="accent">Accent</DaisyButton>
            <DaisyButton variant="ghost">Ghost</DaisyButton>
            <DaisyButton variant="link">Link</DaisyButton>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '16px' }}>States</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <DaisyButton variant="info">Info</DaisyButton>
            <DaisyButton variant="success">Success</DaisyButton>
            <DaisyButton variant="warning">Warning</DaisyButton>
            <DaisyButton variant="error">Error</DaisyButton>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '16px' }}>Sizes</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <DaisyButton variant="primary" size="xs">Extra Small</DaisyButton>
            <DaisyButton variant="primary" size="sm">Small</DaisyButton>
            <DaisyButton variant="primary" size="md">Medium</DaisyButton>
            <DaisyButton variant="primary" size="lg">Large</DaisyButton>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '16px' }}>Styles</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <DaisyButton variant="primary" outline>Outline</DaisyButton>
            <DaisyButton variant="secondary" glass>Glass</DaisyButton>
            <DaisyButton variant="accent" wide>Wide Button</DaisyButton>
            <DaisyButton variant="primary" loading>Loading...</DaisyButton>
            <DaisyButton variant="primary" disabled>Disabled</DaisyButton>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '16px' }}>Shapes</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <DaisyButton variant="primary" shape="square">SQ</DaisyButton>
            <DaisyButton variant="secondary" shape="circle">🎯</DaisyButton>
          </div>
        </div>
      </section>

      {/* Badges Section */}
      <section style={{ marginBottom: '64px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>Badges</h2>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '16px' }}>Variants</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <DaisyBadge variant="neutral">Neutral</DaisyBadge>
            <DaisyBadge variant="primary">Primary</DaisyBadge>
            <DaisyBadge variant="secondary">Secondary</DaisyBadge>
            <DaisyBadge variant="accent">Accent</DaisyBadge>
            <DaisyBadge variant="ghost">Ghost</DaisyBadge>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '16px' }}>States</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <DaisyBadge variant="info">Info</DaisyBadge>
            <DaisyBadge variant="success">Success</DaisyBadge>
            <DaisyBadge variant="warning">Warning</DaisyBadge>
            <DaisyBadge variant="error">Error</DaisyBadge>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '16px' }}>Sizes</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <DaisyBadge variant="primary" size="xs">XS</DaisyBadge>
            <DaisyBadge variant="primary" size="sm">Small</DaisyBadge>
            <DaisyBadge variant="primary" size="md">Medium</DaisyBadge>
            <DaisyBadge variant="primary" size="lg">Large</DaisyBadge>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '16px' }}>Outline</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <DaisyBadge variant="primary" outline>Primary</DaisyBadge>
            <DaisyBadge variant="secondary" outline>Secondary</DaisyBadge>
            <DaisyBadge variant="accent" outline>Accent</DaisyBadge>
          </div>
        </div>
      </section>

      {/* Alerts Section */}
      <section style={{ marginBottom: '64px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>Alerts</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <DaisyAlert
            variant="info"
            title="Information"
            message="This is an informational message."
          />

          <DaisyAlert
            variant="success"
            title="Success!"
            message="Your action was completed successfully."
          />

          <DaisyAlert
            variant="warning"
            title="Warning"
            message="Please review this important information."
          />

          <DaisyAlert
            variant="error"
            title="Error"
            message="Something went wrong. Please try again."
          />

          <DaisyAlert
            variant="info"
            message="Alert with action button"
            actions={
              <DaisyButton variant="ghost" size="sm">See details</DaisyButton>
            }
          />
        </div>
      </section>

      {/* Cards Section */}
      <section style={{ marginBottom: '64px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>Cards</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          <DaisyCard
            title="Simple Card"
            description="This is a simple card with a title and description."
            shadow
          >
            <p>Additional card content can go here.</p>
          </DaisyCard>

          <DaisyCard
            title="Card with Image"
            description="A card with an image at the top."
            image="https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400"
            shadow
            actions={
              <DaisyButton variant="primary" size="sm">Learn More</DaisyButton>
            }
          />

          <DaisyCard
            title="Card with Actions"
            description="This card has multiple action buttons."
            shadow
            actions={
              <div style={{ display: 'flex', gap: '8px' }}>
                <DaisyButton variant="primary" size="sm">Accept</DaisyButton>
                <DaisyButton variant="ghost" size="sm">Decline</DaisyButton>
              </div>
            }
          />

          <DaisyCard
            variant="bordered"
            title="Bordered Card"
            description="A card with borders instead of shadow."
          >
            <DaisyBadge variant="success">New</DaisyBadge>
          </DaisyCard>

          <DaisyCard
            glass
            title="Glass Card"
            description="A card with glass morphism effect."
          >
            <p style={{ fontSize: '14px', color: '#666' }}>
              The glass effect creates a modern, translucent appearance.
            </p>
          </DaisyCard>

          <DaisyCard
            variant="compact"
            title="Compact Card"
            description="A more compact version with less padding."
            shadow
          />
        </div>
      </section>

      {/* Combined Example */}
      <section>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>Combined Example</h2>

        <DaisyCard
          title="User Profile"
          description="Manage your account settings and preferences"
          shadow
        >
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <DaisyBadge variant="primary">Premium</DaisyBadge>
              <DaisyBadge variant="success" outline>Verified</DaisyBadge>
            </div>

            <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
              You have access to all premium features. Your account is verified and secure.
            </p>

            <DaisyAlert
              variant="info"
              message="Complete your profile to unlock more features."
              actions={
                <DaisyButton variant="ghost" size="sm">Complete Now</DaisyButton>
              }
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <DaisyButton variant="primary">Edit Profile</DaisyButton>
            <DaisyButton variant="secondary" outline>Settings</DaisyButton>
            <DaisyButton variant="ghost">Log Out</DaisyButton>
          </div>
        </DaisyCard>
      </section>
    </div>
  );
};
