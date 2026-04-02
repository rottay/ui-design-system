/**
 * Typography Tests
 *
 * Unit tests for Typography components (Heading, Text, Paragraph).
 * Colocated with component following approved architecture.
 *
 * @module Typography/tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Typography, Heading, Text, Paragraph } from './';

function stripTypographyProps(props: Record<string, unknown>) {
  const {
    engine: _engine,
    tenant: _tenant,
    size: _size,
    weight: _weight,
    color: _color,
    underline: _underline,
    strikethrough: _strikethrough,
    italic: _italic,
    monospace: _monospace,
    truncate: _truncate,
    lineClamp: _lineClamp,
    align: _align,
    copyable: _copyable,
    ellipsis: _ellipsis,
    mark: _mark,
    code: _code,
    keyboard: _keyboard,
    delete: _delete,
    strong: _strong,
    type: _type,
    ...domProps
  } = props;

  return domProps;
}

// Mock the engine implementations to avoid async loading issues in tests
vi.mock('./engines/classic', () => ({
  ClassicHeading: vi.fn(({ children, level = 'h2', ...props }: any) => {
    const Component = level;
    return (
      <Component data-testid="heading" data-engine="classic" {...stripTypographyProps(props)}>
        {children}
      </Component>
    );
  }),
  ClassicText: vi.fn(({ children, as = 'span', ...props }: any) => {
    const Component = as;
    return (
      <Component data-testid="text" data-engine="classic" {...stripTypographyProps(props)}>
        {children}
      </Component>
    );
  }),
  ClassicParagraph: vi.fn(({ children, ...props }: any) => (
    <p data-testid="paragraph" data-engine="classic" {...stripTypographyProps(props)}>
      {children}
    </p>
  )),
  ClassicLink: vi.fn(({ children, href = '#', ...props }: any) => (
    <a data-testid="link" data-engine="classic" href={href} {...stripTypographyProps(props)}>
      {children}
    </a>
  )),
  default: vi.fn(({ children, level = 'h2', ...props }: any) => {
    const Component = level;
    return (
      <Component data-testid="heading" data-engine="classic" {...stripTypographyProps(props)}>
        {children}
      </Component>
    );
  }),
}));

vi.mock('./engines/modern', () => ({
  ModernHeading: vi.fn(({ children, level = 'h2', ...props }: any) => {
    const Component = level;
    return (
      <Component data-testid="heading" data-engine="modern" {...stripTypographyProps(props)}>
        {children}
      </Component>
    );
  }),
  ModernText: vi.fn(({ children, as = 'span', ...props }: any) => {
    const Component = as;
    return (
      <Component data-testid="text" data-engine="modern" {...stripTypographyProps(props)}>
        {children}
      </Component>
    );
  }),
  ModernParagraph: vi.fn(({ children, ...props }: any) => (
    <p data-testid="paragraph" data-engine="modern" {...stripTypographyProps(props)}>
      {children}
    </p>
  )),
  ModernLink: vi.fn(({ children, href = '#', ...props }: any) => (
    <a data-testid="link" data-engine="modern" href={href} {...stripTypographyProps(props)}>
      {children}
    </a>
  )),
  default: vi.fn(({ children, level = 'h2', ...props }: any) => {
    const Component = level;
    return (
      <Component data-testid="heading" data-engine="modern" {...stripTypographyProps(props)}>
        {children}
      </Component>
    );
  }),
}));

vi.mock('./engines/rustic', () => ({
  RusticHeading: vi.fn(({ children, level = 'h2', ...props }: any) => {
    const Component = level;
    return (
      <Component data-testid="heading" data-engine="rustic" {...stripTypographyProps(props)}>
        {children}
      </Component>
    );
  }),
  RusticText: vi.fn(({ children, as = 'span', ...props }: any) => {
    const Component = as;
    return (
      <Component data-testid="text" data-engine="rustic" {...stripTypographyProps(props)}>
        {children}
      </Component>
    );
  }),
  RusticParagraph: vi.fn(({ children, ...props }: any) => (
    <p data-testid="paragraph" data-engine="rustic" {...stripTypographyProps(props)}>
      {children}
    </p>
  )),
  RusticLink: vi.fn(({ children, href = '#', ...props }: any) => (
    <a data-testid="link" data-engine="rustic" href={href} {...stripTypographyProps(props)}>
      {children}
    </a>
  )),
  default: vi.fn(({ children, level = 'h2', ...props }: any) => {
    const Component = level;
    return (
      <Component data-testid="heading" data-engine="rustic" {...stripTypographyProps(props)}>
        {children}
      </Component>
    );
  }),
}));

// ============================================================================
// Heading Component Tests
// ============================================================================

describe('Typography.Heading', () => {
  it('renders correctly with default props', () => {
    render(<Heading>Test Heading</Heading>);
    expect(screen.getByTestId('heading')).toBeInTheDocument();
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
  });

  it('renders with compound pattern', () => {
    render(<Typography.Heading>Compound Heading</Typography.Heading>);
    expect(screen.getByText('Compound Heading')).toBeInTheDocument();
  });

  it.each(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const)(
    'renders heading level %s',
    (level) => {
      render(<Heading level={level}>Level {level}</Heading>);
      const heading = screen.getByRole('heading', { level: parseInt(level[1]) });
      expect(heading).toBeInTheDocument();
    }
  );

  it('applies custom className', () => {
    render(<Heading className="custom-heading">Styled Heading</Heading>);
    expect(screen.getByTestId('heading')).toHaveClass('custom-heading');
  });

  it('applies custom style', () => {
    render(<Heading style={{ color: 'red' }}>Red Heading</Heading>);
    expect(screen.getByTestId('heading')).toBeInTheDocument();
  });

  it.each(['classic', 'modern', 'rustic'] as const)(
    'renders with %s engine',
    (engine) => {
      render(<Heading engine={engine}>Engine Test</Heading>);
      expect(screen.getByTestId('heading')).toHaveAttribute('data-engine', engine);
    }
  );
});

// ============================================================================
// Text Component Tests
// ============================================================================

describe('Typography.Text', () => {
  it('renders correctly with default props', () => {
    render(<Text>Test Text</Text>);
    expect(screen.getByTestId('text')).toBeInTheDocument();
    expect(screen.getByText('Test Text')).toBeInTheDocument();
  });

  it('renders with compound pattern', () => {
    render(<Typography.Text>Compound Text</Typography.Text>);
    expect(screen.getByText('Compound Text')).toBeInTheDocument();
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const)(
    'renders size %s',
    (size) => {
      render(<Text size={size}>Size {size}</Text>);
      expect(screen.getByText(`Size ${size}`)).toBeInTheDocument();
    }
  );

  it.each(['normal', 'medium', 'semibold', 'bold'] as const)(
    'renders weight %s',
    (weight) => {
      render(<Text weight={weight}>Weight {weight}</Text>);
      expect(screen.getByText(`Weight ${weight}`)).toBeInTheDocument();
    }
  );

  it.each(['default', 'muted', 'primary', 'success', 'warning', 'error'] as const)(
    'renders color %s',
    (color) => {
      render(<Text color={color}>Color {color}</Text>);
      expect(screen.getByText(`Color ${color}`)).toBeInTheDocument();
    }
  );

  it('applies underline decoration', () => {
    render(<Text underline>Underlined</Text>);
    expect(screen.getByText('Underlined')).toBeInTheDocument();
  });

  it('applies strikethrough decoration', () => {
    render(<Text strikethrough>Strikethrough</Text>);
    expect(screen.getByText('Strikethrough')).toBeInTheDocument();
  });

  it('applies italic style', () => {
    render(<Text italic>Italic</Text>);
    expect(screen.getByText('Italic')).toBeInTheDocument();
  });

  it('applies monospace font', () => {
    render(<Text monospace>Code</Text>);
    expect(screen.getByText('Code')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Text className="custom-text">Styled Text</Text>);
    expect(screen.getByTestId('text')).toHaveClass('custom-text');
  });

  it.each(['classic', 'modern', 'rustic'] as const)(
    'renders with %s engine',
    (engine) => {
      render(<Text engine={engine}>Engine Test</Text>);
      expect(screen.getByTestId('text')).toHaveAttribute('data-engine', engine);
    }
  );
});

// ============================================================================
// Paragraph Component Tests
// ============================================================================

describe('Typography.Paragraph', () => {
  it('renders correctly with default props', () => {
    render(<Paragraph>Test Paragraph</Paragraph>);
    expect(screen.getByTestId('paragraph')).toBeInTheDocument();
    expect(screen.getByText('Test Paragraph')).toBeInTheDocument();
  });

  it('renders with compound pattern', () => {
    render(<Typography.Paragraph>Compound Paragraph</Typography.Paragraph>);
    expect(screen.getByText('Compound Paragraph')).toBeInTheDocument();
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const)(
    'renders size %s',
    (size) => {
      render(<Paragraph size={size}>Size {size}</Paragraph>);
      expect(screen.getByText(`Size ${size}`)).toBeInTheDocument();
    }
  );

  it.each(['default', 'muted', 'primary', 'success', 'warning', 'error'] as const)(
    'renders color %s',
    (color) => {
      render(<Paragraph color={color}>Color {color}</Paragraph>);
      expect(screen.getByText(`Color ${color}`)).toBeInTheDocument();
    }
  );

  it.each(['left', 'center', 'right', 'justify'] as const)(
    'renders alignment %s',
    (align) => {
      render(<Paragraph align={align}>Align {align}</Paragraph>);
      expect(screen.getByText(`Align ${align}`)).toBeInTheDocument();
    }
  );

  it('applies truncate prop', () => {
    render(<Paragraph truncate>Truncated paragraph</Paragraph>);
    expect(screen.getByText('Truncated paragraph')).toBeInTheDocument();
  });

  it('applies lineClamp prop', () => {
    render(<Paragraph lineClamp={3}>Line clamped paragraph</Paragraph>);
    expect(screen.getByText('Line clamped paragraph')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Paragraph className="custom-paragraph">Styled Paragraph</Paragraph>);
    expect(screen.getByTestId('paragraph')).toHaveClass('custom-paragraph');
  });

  it.each(['classic', 'modern', 'rustic'] as const)(
    'renders with %s engine',
    (engine) => {
      render(<Paragraph engine={engine}>Engine Test</Paragraph>);
      expect(screen.getByTestId('paragraph')).toHaveAttribute('data-engine', engine);
    }
  );
});

// ============================================================================
// Typography Namespace Tests
// ============================================================================

describe('Typography namespace', () => {
  it('exposes Heading sub-component', () => {
    expect(Typography.Heading).toBeDefined();
  });

  it('exposes Text sub-component', () => {
    expect(Typography.Text).toBeDefined();
  });

  it('exposes Paragraph sub-component', () => {
    expect(Typography.Paragraph).toBeDefined();
  });

  it('renders all sub-components in a compound pattern', () => {
    render(
      <article>
        <Typography.Heading level="h1">Title</Typography.Heading>
        <Typography.Text>Description</Typography.Text>
        <Typography.Paragraph>Content</Typography.Paragraph>
      </article>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});

// ============================================================================
// Type Exports Tests
// ============================================================================

describe('Type exports', () => {
  it('exports TYPOGRAPHY_DEFAULTS', async () => {
    const module = await import('./Typography.types');
    expect(module.TYPOGRAPHY_DEFAULTS).toBeDefined();
    expect(module.TYPOGRAPHY_DEFAULTS.heading.level).toBe('h2');
    expect(module.TYPOGRAPHY_DEFAULTS.text.size).toBe('md');
    expect(module.TYPOGRAPHY_DEFAULTS.paragraph.size).toBe('md');
  });

  it('exports SIZE_MAP', async () => {
    const module = await import('./Typography.types');
    expect(module.SIZE_MAP).toBeDefined();
    expect(module.SIZE_MAP.heading).toBeDefined();
    expect(module.SIZE_MAP.text).toBeDefined();
  });

  it('exports WEIGHT_MAP', async () => {
    const module = await import('./Typography.types');
    expect(module.WEIGHT_MAP).toBeDefined();
    expect(module.WEIGHT_MAP.bold).toBe(700);
  });

  it('exports COLOR_MAP', async () => {
    const module = await import('./Typography.types');
    expect(module.COLOR_MAP).toBeDefined();
    expect(module.COLOR_MAP.primary).toBe('var(--ds-color-primary-500)');
  });
});

describe('Typography tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders Heading with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Heading>Test</Heading>);
    expect(screen.getByTestId('heading')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });

  it.each(['rottay', 'bithire', 'default'] as const)('renders Text with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Text>Test</Text>);
    expect(screen.getByTestId('text')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });

  it.each(['rottay', 'bithire', 'default'] as const)('renders Paragraph with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Paragraph>Test</Paragraph>);
    expect(screen.getByTestId('paragraph')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
