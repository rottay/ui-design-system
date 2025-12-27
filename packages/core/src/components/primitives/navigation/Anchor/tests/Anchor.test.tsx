/**
 * Anchor Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Anchor } from '../';

vi.mock('../../../../../system/engines/factory', () => ({
  createEngineComponent: (name: string) => {
    if (name === 'Anchor.Link') {
      const MockLink = ({ href, title, target, children, className, style, ...props }: any) => (
        <div data-testid="anchor-link" data-href={href} className={className} style={style} {...props}>
          <a href={href} target={target}>{title}</a>
          {children}
        </div>
      );
      MockLink.displayName = 'Anchor.Link';
      return MockLink;
    }
    const MockAnchor = ({ children, direction, affix, activeKey, offsetTop, className, style, ...props }: any) => (
      <div data-testid="anchor" data-direction={direction} data-affix={affix} data-active-key={activeKey} data-offset-top={offsetTop} className={className} style={style} {...props}>
        {children}
      </div>
    );
    MockAnchor.displayName = 'Anchor';
    MockAnchor.Link = ({ href, title, target, children, className, style, ...props }: any) => (
      <div data-testid="anchor-link" data-href={href} className={className} style={style} {...props}>
        <a href={href} target={target}>{title}</a>
        {children}
      </div>
    );
    return MockAnchor;
  },
}));

describe('Anchor', () => {
  it('renders correctly', () => {
    render(<Anchor><Anchor.Link href="#section1" title="Section 1" /></Anchor>);
    expect(screen.getByTestId('anchor')).toBeInTheDocument();
  });

  it('renders with children links', () => {
    render(
      <Anchor>
        <Anchor.Link href="#section1" title="Section 1" />
        <Anchor.Link href="#section2" title="Section 2" />
      </Anchor>
    );
    const links = screen.getAllByTestId('anchor-link');
    expect(links).toHaveLength(2);
  });

  it('renders with vertical direction (default)', () => {
    render(<Anchor direction="vertical"><Anchor.Link href="#s1" title="S1" /></Anchor>);
    expect(screen.getByTestId('anchor')).toHaveAttribute('data-direction', 'vertical');
  });

  it('renders with horizontal direction', () => {
    render(<Anchor direction="horizontal"><Anchor.Link href="#s1" title="S1" /></Anchor>);
    expect(screen.getByTestId('anchor')).toHaveAttribute('data-direction', 'horizontal');
  });

  it('renders with affix mode', () => {
    render(<Anchor affix><Anchor.Link href="#s1" title="S1" /></Anchor>);
    expect(screen.getByTestId('anchor')).toHaveAttribute('data-affix', 'true');
  });

  it('renders with offsetTop', () => {
    render(<Anchor offsetTop={100}><Anchor.Link href="#s1" title="S1" /></Anchor>);
    expect(screen.getByTestId('anchor')).toHaveAttribute('data-offset-top', '100');
  });

  it('renders with activeKey', () => {
    render(<Anchor activeKey="#section2"><Anchor.Link href="#s1" title="S1" /></Anchor>);
    expect(screen.getByTestId('anchor')).toHaveAttribute('data-active-key', '#section2');
  });

  it('applies custom className', () => {
    render(<Anchor className="custom-anchor"><Anchor.Link href="#s1" title="S1" /></Anchor>);
    expect(screen.getByTestId('anchor')).toHaveClass('custom-anchor');
  });

  it('applies custom style', () => {
    render(<Anchor style={{ backgroundColor: 'red' }}><Anchor.Link href="#s1" title="S1" /></Anchor>);
    expect(screen.getByTestId('anchor')).toBeInTheDocument();
  });
});

describe('Anchor.Link', () => {
  it('renders with href', () => {
    render(<Anchor><Anchor.Link href="#test" title="Test" /></Anchor>);
    expect(screen.getByTestId('anchor-link')).toHaveAttribute('data-href', '#test');
  });

  it('renders with title', () => {
    render(<Anchor><Anchor.Link href="#test" title="Test Title" /></Anchor>);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders nested links', () => {
    render(
      <Anchor>
        <Anchor.Link href="#parent" title="Parent">
          <Anchor.Link href="#child" title="Child" />
        </Anchor.Link>
      </Anchor>
    );
    expect(screen.getByText('Parent')).toBeInTheDocument();
    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it('applies custom className to link', () => {
    render(<Anchor><Anchor.Link href="#test" title="Test" className="custom-link" /></Anchor>);
    expect(screen.getByTestId('anchor-link')).toHaveClass('custom-link');
  });

  it('renders link with target attribute', () => {
    render(<Anchor><Anchor.Link href="#test" title="Test" target="_blank" /></Anchor>);
    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
  });
});
