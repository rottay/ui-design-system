import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import type { StableEngineName } from '../../../testing/helpers/engine-test-utils';
import { STABLE_ENGINES, renderWithEngine } from '../../../testing/helpers/engine-test-utils';
import type { UserProfileCardProps } from './UserProfileCard.types';
import ClassicUserProfileCard from './engines/classic';
import ModernUserProfileCard from './engines/modern';
import RusticUserProfileCard from './engines/rustic';

const COMPONENTS: Record<StableEngineName, React.ComponentType<UserProfileCardProps>> = {
  classic: ClassicUserProfileCard,
  modern: ModernUserProfileCard,
  rustic: RusticUserProfileCard,
};

function createProps(overrides: Partial<UserProfileCardProps> = {}): UserProfileCardProps {
  return {
    user: {
      name: 'Jane Doe',
      role: 'Product Manager',
      email: 'jane@example.com',
      department: 'Engineering',
      status: 'active',
    },
    ...overrides,
  };
}

describe('PatternUserProfileCard', () => {
  it.each(STABLE_ENGINES)(
    'renders user name and role with the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('Product Manager')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'renders email when provided in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByText(/jane@example\.com/)).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'renders department badge in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByText('Engineering')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'renders compact variant in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps({ variant: 'compact' })} />, engine);

      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('Product Manager')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'renders action buttons in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onClick = vi.fn();
      renderWithEngine(
        <Component
          {...createProps({
            actions: [
              { key: 'msg', label: 'Message', onClick, variant: 'primary' },
              { key: 'block', label: 'Block', onClick: vi.fn(), variant: 'danger' },
            ],
          })}
        />,
        engine,
      );

      expect(screen.getByText('Message')).toBeInTheDocument();
      expect(screen.getByText('Block')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Message'));
      expect(onClick).toHaveBeenCalled();
    },
  );

  it.each(STABLE_ENGINES)(
    'fires onClick when card is clicked in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onClick = vi.fn();
      renderWithEngine(<Component {...createProps({ onClick })} />, engine);

      fireEvent.click(screen.getByText('Jane Doe'));
      expect(onClick).toHaveBeenCalled();
    },
  );
});
