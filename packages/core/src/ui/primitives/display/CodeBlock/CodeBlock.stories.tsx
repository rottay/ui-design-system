/**
 * CodeBlock Stories
 * Colocated with component following approved architecture
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CodeBlock, registerHighlighter } from './';
import type { HighlighterAdapter, HighlightTokenLine } from './';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';

const meta: Meta<typeof CodeBlock> = {
  title: 'Primitives/Display/CodeBlock',
  component: CodeBlock,
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
          'Source-code display primitive with an optional line-number gutter, line highlighting, soft wrap, and a copy control. Syntax highlighting is delegated to an app-registered HighlighterAdapter; the DS ships no tokenizer. Single engine-agnostic implementation (no engine split).',
      },
    },
  },
  argTypes: {
    showLineNumbers: { control: 'boolean' },
    wrap: { control: 'boolean' },
    language: { control: 'text' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

const TS_SAMPLE = `interface Candidate {
  id: string;
  name: string;
  stage: 'screening' | 'interview' | 'offer';
}

export function isHired(candidate: Candidate): boolean {
  return candidate.stage === 'offer';
}`;

const LONG_LINE_SAMPLE = `const query = "SELECT candidates.id, candidates.name, scorecards.overall_score, interviews.scheduled_at FROM candidates INNER JOIN scorecards ON scorecards.candidate_id = candidates.id INNER JOIN interviews ON interviews.candidate_id = candidates.id WHERE candidates.stage = 'interview' ORDER BY scorecards.overall_score DESC LIMIT 25;";
const endpoint = "https://api.example.test/v1/tenants/acme/pipelines/hiring/candidates?filter[stage]=interview&sort=-score&page[size]=25&include=scorecards,interviews";`;

export const Default: Story = {
  args: {
    code: TS_SAMPLE,
    language: 'ts',
    copyLabel: 'Copy',
    copiedLabel: 'Copied',
  },
};

export const LineNumbers: Story = {
  args: {
    code: TS_SAMPLE,
    language: 'ts',
    showLineNumbers: true,
    copyLabel: 'Copy',
    copiedLabel: 'Copied',
  },
};

export const HighlightedLines: Story = {
  args: {
    code: TS_SAMPLE,
    language: 'ts',
    showLineNumbers: true,
    highlightLines: [7],
    copyLabel: 'Copy',
    copiedLabel: 'Copied',
  },
};

export const WrapLongLines: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 560 }}>
      <div>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.55, marginBottom: 8 }}>
          Scroll (default)
        </div>
        <CodeBlock code={LONG_LINE_SAMPLE} language="sql" copyLabel="Copy" copiedLabel="Copied" />
      </div>
      <div>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.55, marginBottom: 8 }}>
          Wrap
        </div>
        <CodeBlock code={LONG_LINE_SAMPLE} language="sql" wrap copyLabel="Copy" copiedLabel="Copied" />
      </div>
    </div>
  ),
};

export const WithTitle: Story = {
  args: {
    code: TS_SAMPLE,
    language: 'ts',
    title: 'candidate.ts',
    showLineNumbers: true,
    copyLabel: 'Copy',
    copiedLabel: 'Copied',
  },
};

const KEYWORDS = new Set(['interface', 'export', 'function', 'return', 'const', 'string']);

/**
 * Toy synchronous highlighter proving the adapter port: keywords and string
 * literals resolve through DS token colors, everything else inherits. The
 * adapter unregisters on unmount so no global state leaks between stories.
 */
const toyAdapter: HighlighterAdapter = {
  id: 'storybook-toy',
  ssr: true,
  highlight(code: string): HighlightTokenLine[] {
    return code.replace(/\n$/, '').split('\n').map((line) => ({
      tokens: line.split(/('[^']*'|\s+)/).filter(Boolean).map((piece) => {
        if (KEYWORDS.has(piece)) {
          return { content: piece, color: 'var(--ds-color-primary)', fontStyle: 'bold' as const };
        }
        if (piece.startsWith("'")) {
          return { content: piece, color: 'var(--ds-color-success)' };
        }
        return { content: piece };
      }),
    }));
  },
};

function ToyHighlightedBlock() {
  React.useEffect(() => {
    registerHighlighter(toyAdapter);
    return () => registerHighlighter(null);
  }, []);
  return (
    <CodeBlock
      code={TS_SAMPLE}
      language="ts"
      showLineNumbers
      title="candidate.ts"
      copyLabel="Copy"
      copiedLabel="Copied"
    />
  );
}

export const RegisteredHighlighter: Story = {
  name: '🎨 Registered highlighter',
  render: () => <ToyHighlightedBlock />,
};

export const RtlGutter: Story = {
  name: '↔ RTL gutter',
  render: () => (
    <div dir="rtl" style={{ maxWidth: 560 }}>
      <CodeBlock
        code={TS_SAMPLE}
        language="ts"
        showLineNumbers
        highlightLines={[7]}
        title="candidate.ts"
        copyLabel="نسخ"
        copiedLabel="تم النسخ"
      />
    </div>
  ),
};
