/**
 * VoiceInputButton Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { VoiceInputButton } from './';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';

const meta: Meta<typeof VoiceInputButton> = {
  title: 'Primitives/Inputs/VoiceInputButton',
  component: VoiceInputButton,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <Story />
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Microphone button around `useVoiceInput` (Web Speech API) with idle/listening/transcribing/error states. Renders nothing in browsers without SpeechRecognition support — consumers need no support gate of their own. Single engine-agnostic implementation; all paint and geometry lives in the family skin (`voice-input-button.css`) keyed by data-size/data-variant/data-status.',
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    variant: { control: 'select', options: ['ghost', 'filled'] },
    lang: { control: 'text' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof VoiceInputButton>;

const matrixLabel = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  opacity: 0.55,
  marginBottom: 8,
} as const;

export const Default: Story = {
  args: {
    lang: 'en-US',
    onTranscript: (text: string) => console.log('Transcript:', text),
  },
};

export const SizesAndVariants: Story = {
  name: '📐 Sizes × Variants',
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      {(['ghost', 'filled'] as const).map((variant) => (
        <div key={variant}>
          <div style={matrixLabel}>{variant}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {(['sm', 'md'] as const).map((size) => (
              <VoiceInputButton
                key={`${variant}-${size}`}
                lang="en-US"
                size={size}
                variant={variant}
                onTranscript={(text) => console.log('Transcript:', text)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const UnsupportedBrowser: Story = {
  name: '🚫 Unsupported browser',
  render: () => {
    const supported =
      typeof window !== 'undefined' &&
      Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
    return (
      <div style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        <div style={matrixLabel}>Support gate</div>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
          {supported
            ? 'This browser exposes SpeechRecognition, so the button renders below. In an unsupported browser (e.g. Firefox without the flag) the component renders null and the layout collapses to the text field alone.'
            : 'This browser has no SpeechRecognition: the component rendered nothing (null), which is the intended graceful degradation.'}
        </p>
        <div>
          <VoiceInputButton lang="en-US" onTranscript={() => undefined} />
        </div>
      </div>
    );
  },
};
