/**
 * MarkdownView Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { MarkdownView } from './';
import { CodeBlock } from '../CodeBlock';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';

const meta: Meta<typeof MarkdownView> = {
  title: 'Primitives/Display/MarkdownView',
  component: MarkdownView,
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
          'Renders a bounded CommonMark subset (headings, emphasis, lists, task lists, fenced code, blockquotes, GFM tables, links, thematic breaks) as token-governed DOM. XSS-safe by construction: no raw-HTML passthrough and no dangerouslySetInnerHTML anywhere; disallowed link schemes downgrade to inert text. Single engine-agnostic implementation (no engine split).',
      },
    },
  },
  argTypes: {
    density: { control: 'select', options: ['compact', 'comfortable'] },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MarkdownView>;

const KITCHEN_SINK = `# Interview feedback

Strong **system design** instincts and *clear communication*. Asked about
\`useEffect\` cleanup semantics and answered precisely.

## Scorecard

| Area | Signal | Weight |
| ---- | :----: | -----: |
| Algorithms | Strong | 3 |
| Communication | Mixed | 2 |
| Ownership | Strong | 3 |

> "The candidate reasoned about trade-offs before writing any code."
> — Panel lead

### Next steps

1. Collect references
2. Prepare the offer
3. Schedule the onboarding plan

- [x] Technical interview
- [x] Culture interview
- [ ] Offer approval

---

Read the [hiring playbook](https://example.test/playbook) before the debrief.

\`\`\`ts
const decision = panel.every((v) => v.score >= 3) ? 'hire' : 'hold';
\`\`\``;

export const Default: Story = {
  args: {
    source: KITCHEN_SINK,
  },
};

export const Densities: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
      {(['comfortable', 'compact'] as const).map((density) => (
        <div key={density}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.55, marginBottom: 8 }}>
            {density}
          </div>
          <MarkdownView density={density} source={KITCHEN_SINK} />
        </div>
      ))}
    </div>
  ),
};

export const LinkSafety: Story = {
  name: '🔒 Link safety',
  render: () => (
    <MarkdownView
      source={[
        'Safe: [playbook](https://example.test) and [email](mailto:panel@example.test).',
        '',
        'Downgraded to inert text: [steal](javascript:alert(1)) and [blob](data:text/html;base64,PGI+).',
        '',
        'Raw HTML stays literal: <script>alert(1)</script>',
      ].join('\n')}
    />
  ),
};

export const CodeSlot: Story = {
  name: '🧩 Code slot (CodeBlock)',
  render: () => (
    <MarkdownView
      source={'```ts\nconst stage: Stage = "offer";\n```'}
      slots={{
        code: ({ code, language }) => (
          <CodeBlock
            code={code}
            language={language}
            showLineNumbers
            copyLabel="Copy"
            copiedLabel="Copied"
          />
        ),
      }}
    />
  ),
};

export const RtlDocument: Story = {
  name: '↔ RTL document',
  render: () => (
    <div dir="rtl">
      <MarkdownView
        source={[
          '# ملاحظات المقابلة',
          '',
          'أظهر المرشح **فهماً عميقاً** للأنظمة الموزعة و*تواصلاً واضحاً*.',
          '',
          '> «راجع المفاضلات قبل كتابة أي شيفرة» — قائد اللجنة',
          '',
          '- [x] المقابلة التقنية',
          '- [ ] اعتماد العرض',
          '',
          '| المجال | الإشارة |',
          '| ----- | -----: |',
          '| الخوارزميات | قوية |',
        ].join('\n')}
      />
    </div>
  ),
};
