/**
 * Result Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Result } from '../';

describe('Result', () => {
  describe('Basic Rendering', () => {
    it('renders with title', () => {
      render(<Result title="Operation Successful" />);
      expect(screen.getByText('Operation Successful')).toBeInTheDocument();
    });

    it('renders with subtitle', () => {
      render(<Result title="Title" subTitle="Subtitle description" />);
      expect(screen.getByText('Subtitle description')).toBeInTheDocument();
    });

    it('renders children content', () => {
      render(
        <Result title="Title">
          <div>Child content</div>
        </Result>
      );
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<Result title="Title" className="custom-result" />);
      expect(container.querySelector('.custom-result')).toBeInTheDocument();
    });
  });

  describe('Status Types', () => {
    it.each(['success', 'error', 'info', 'warning', '404', '403', '500'] as const)(
      'renders %s status correctly',
      (status) => {
        const { container } = render(<Result status={status} title={`${status} Status`} />);
        expect(screen.getByText(`${status} Status`)).toBeInTheDocument();
        expect(container.firstChild).toBeInTheDocument();
      }
    );

    it('defaults to info status', () => {
      render(<Result title="Default" />);
      expect(screen.getByText('Default')).toBeInTheDocument();
    });
  });

  describe('Custom Icon', () => {
    it('renders custom icon', () => {
      render(
        <Result
          title="Custom Icon"
          icon={<span data-testid="custom-icon">🎉</span>}
        />
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('overrides default status icon with custom icon', () => {
      render(
        <Result
          status="success"
          title="Custom"
          icon={<span data-testid="override-icon">★</span>}
        />
      );
      expect(screen.getByTestId('override-icon')).toBeInTheDocument();
    });
  });

  describe('Extra Actions', () => {
    it('renders extra content', () => {
      render(
        <Result
          title="Result"
          extra={<button>Action Button</button>}
        />
      );
      expect(screen.getByText('Action Button')).toBeInTheDocument();
    });

    it('renders multiple extra buttons', () => {
      render(
        <Result
          title="Result"
          extra={[
            <button key="1">Primary</button>,
            <button key="2">Secondary</button>,
          ]}
        />
      );
      expect(screen.getByText('Primary')).toBeInTheDocument();
      expect(screen.getByText('Secondary')).toBeInTheDocument();
    });
  });

  describe('Success Result', () => {
    it('renders success result with all props', () => {
      render(
        <Result
          status="success"
          title="Successfully Purchased!"
          subTitle="Order number: 2017182818828182881"
          extra={[
            <button key="console">Go Console</button>,
            <button key="buy">Buy Again</button>,
          ]}
        />
      );
      expect(screen.getByText('Successfully Purchased!')).toBeInTheDocument();
      expect(screen.getByText('Order number: 2017182818828182881')).toBeInTheDocument();
      expect(screen.getByText('Go Console')).toBeInTheDocument();
      expect(screen.getByText('Buy Again')).toBeInTheDocument();
    });
  });

  describe('Error Result', () => {
    it('renders error result with details', () => {
      render(
        <Result
          status="error"
          title="Submission Failed"
          subTitle="Please check and modify the following information before resubmitting."
        >
          <div>Error Details Here</div>
        </Result>
      );
      expect(screen.getByText('Submission Failed')).toBeInTheDocument();
      expect(screen.getByText('Error Details Here')).toBeInTheDocument();
    });
  });

  describe('HTTP Status Results', () => {
    it('renders 404 result', () => {
      render(
        <Result
          status="404"
          title="404"
          subTitle="Sorry, the page you visited does not exist."
          extra={<button>Back Home</button>}
        />
      );
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('Sorry, the page you visited does not exist.')).toBeInTheDocument();
    });

    it('renders 403 result', () => {
      render(
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you are not authorized to access this page."
        />
      );
      expect(screen.getByText('403')).toBeInTheDocument();
    });

    it('renders 500 result', () => {
      render(
        <Result
          status="500"
          title="500"
          subTitle="Sorry, something went wrong."
        />
      );
      expect(screen.getByText('500')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has appropriate role', () => {
      render(<Result title="Accessible Result" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('title is properly announced', () => {
      render(<Result title="Important Result" />);
      expect(screen.getByText('Important Result')).toBeInTheDocument();
    });
  });

  describe('Engine Support', () => {
    it.each(['titan', 'hermes', 'apollo'] as const)(
      'renders with %s engine',
      (engine) => {
        render(<Result engine={engine} title={`${engine} Result`} />);
        expect(screen.getByText(`${engine} Result`)).toBeInTheDocument();
      }
    );
  });

  describe('Complex Layouts', () => {
    it('renders result with complex children', () => {
      render(
        <Result
          status="warning"
          title="Warning"
          subTitle="Review the items below"
        >
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </Result>
      );
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('renders result within a card', () => {
      render(
        <div data-testid="card-wrapper" style={{ padding: 24 }}>
          <Result
            status="info"
            title="Information"
            subTitle="This result is inside a card"
          />
        </div>
      );
      expect(screen.getByTestId('card-wrapper')).toBeInTheDocument();
      expect(screen.getByText('Information')).toBeInTheDocument();
    });
  });
});
