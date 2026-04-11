import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithEngine, STABLE_ENGINES } from '../../../../../_internal/testing/helpers/engine-test-utils';

const users = [
  { name: 'Ada Lovelace', email: 'ada@rottay.dev' },
  { name: 'Grace Hopper', email: 'grace@rottay.dev' },
];

describe('List integration', () => {
  it.each(STABLE_ENGINES)('renders the live list with the %s engine', async (engine) => {
    const { List } = await import('..');

    renderWithEngine(
      <List
        engine={engine}
        header="Team"
        footer="2 members"
        dataSource={users}
        renderItem={(user) => (
          <List.Item>
            <List.Item.Meta title={user.name} description={user.email} />
          </List.Item>
        )}
      />,
      engine
    );

    expect(await screen.findByText('Team', undefined, { timeout: 30000 })).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('2 members')).toBeInTheDocument();
  });
});
