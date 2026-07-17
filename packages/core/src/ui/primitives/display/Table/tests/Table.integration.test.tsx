import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { renderWithEngine, STABLE_ENGINES } from '../../../../../tooling/testing/helpers/engine';

const columns = [
  {
    key: 'name',
    title: 'Name',
    dataIndex: 'name',
    sorter: (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name),
  },
  {
    key: 'role',
    title: 'Role',
    dataIndex: 'role',
  },
];

const data = [
  { key: '2', name: 'Bea', role: 'Designer' },
  { key: '1', name: 'Alex', role: 'Engineer' },
];

describe('Table integration', () => {
  it.each(STABLE_ENGINES)('renders the live table with the %s engine', async (engine) => {
    const { Table } = await import('..');

    renderWithEngine(
      <Table engine={engine} columns={columns} dataSource={data} pagination={false} />,
      engine
    );

    expect(await screen.findByText('Name', undefined, { timeout: 30000 })).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Alex')).toBeInTheDocument();
    expect(screen.getByText('Designer')).toBeInTheDocument();
  }, 45000);

  it('supports live sorting interactions in the rustic engine', async () => {
    const { Table } = await import('..');

    renderWithEngine(
      <Table engine="rustic" columns={columns} dataSource={data} pagination={false} />,
      'rustic'
    );

    const header = await screen.findByText('Name', undefined, { timeout: 30000 });
    fireEvent.click(header);

    const rows = screen.getAllByRole('row');
    expect(rows.at(1)).toHaveTextContent('Alex');
    expect(rows.at(2)).toHaveTextContent('Bea');
  });
});
