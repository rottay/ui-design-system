import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Layout } from '..';
import { renderWithEngine } from '../../../../../testing/helpers/engine-test-utils';

describe('Layout runtime engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)(
    'renders the compound layout API through the live %s engine',
    async (engine) => {
      renderWithEngine(
        <Layout hasSider engine={engine}>
          <Layout.Sider engine={engine} width={240} collapsible theme="dark">
            Navigation
          </Layout.Sider>
          <Layout engine={engine}>
            <Layout.Header engine={engine}>Header</Layout.Header>
            <Layout.Content engine={engine}>Content</Layout.Content>
            <Layout.Footer engine={engine}>Footer</Layout.Footer>
          </Layout>
        </Layout>,
        engine
      );

      expect(await screen.findByText('Navigation')).toBeInTheDocument();
      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    }
  );
});
