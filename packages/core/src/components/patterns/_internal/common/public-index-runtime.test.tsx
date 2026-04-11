import React from 'react';
import { screen } from '@testing-library/react';
import { describeEachEngine, renderWithEngine } from '../../../_internal/testing/helpers/engine-test-utils';
import { PatternActivityLog } from '../activity-log';
import { PatternCommentThread } from '../comment-thread';
import { PatternFileManager } from '../file-manager';
import { PatternInvoiceTemplate } from '../invoice-template';
import { PatternNotificationCenter } from '../notification-center';
import { PatternPricingTable } from '../pricing-table';
import { PatternUserProfileCard } from '../user-profile-card';

describeEachEngine('public pattern indexes', (engine) => {
  it('loads PatternActivityLog through the public component', async () => {
    renderWithEngine(
      <PatternActivityLog
        activities={[
          {
            id: 'a1',
            user: { name: 'Alice' },
            action: 'created',
            timestamp: new Date().toISOString(),
          },
        ]}
      />,
      engine
    );

    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('created')).toBeInTheDocument();
  });

  it('loads PatternCommentThread through the public component', async () => {
    renderWithEngine(
      <PatternCommentThread
        comments={[
          {
            id: 'c1',
            author: { name: 'Alice' },
            content: 'Looks good',
            timestamp: new Date().toISOString(),
          },
        ]}
      />,
      engine
    );

    expect(await screen.findByText('Looks good')).toBeInTheDocument();
  });

  it('loads PatternFileManager through the public component', async () => {
    renderWithEngine(
      <PatternFileManager
        files={[{ id: 'f1', name: 'report.pdf', type: 'file', size: 1024 }]}
        folders={[{ id: 'd1', name: 'Documents', type: 'folder', childCount: 2 }]}
      />,
      engine
    );

    expect(await screen.findByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
  });

  it('loads PatternInvoiceTemplate through the public component', async () => {
    renderWithEngine(
      <PatternInvoiceTemplate
        invoice={{
          number: 'INV-1',
          date: '2026-03-14',
          dueDate: '2026-04-14',
          status: 'sent',
          company: { name: 'Rottay', address: '123 Main', city: 'NYC', email: 'billing@rottay.dev' },
          client: { name: 'Acme', address: '456 Oak', city: 'LA', email: 'ap@acme.dev' },
          items: [{ id: 'i1', description: 'Platform', quantity: 1, unitPrice: 500, total: 500 }],
          subtotal: 500,
          tax: 50,
          taxRate: 10,
          total: 550,
        }}
      />,
      engine
    );

    expect(await screen.findByText('INV-1')).toBeInTheDocument();
    expect(screen.getByText('Rottay')).toBeInTheDocument();
  });

  it('loads PatternNotificationCenter through the public component', async () => {
    renderWithEngine(
      <PatternNotificationCenter
        open
        notifications={[
          {
            id: 'n1',
            title: 'New message',
            message: 'Alice sent a message',
            type: 'info',
            read: false,
            timestamp: new Date().toISOString(),
          },
        ]}
      />,
      engine
    );

    expect(await screen.findByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('New message')).toBeInTheDocument();
  });

  it('loads PatternPricingTable through the public component', async () => {
    renderWithEngine(
      <PatternPricingTable
        plans={[
          { id: 'free', name: 'Free', price: 0, cta: 'Start', features: { storage: '1 GB' } },
          { id: 'pro', name: 'Pro', price: 29, cta: 'Upgrade', popular: true, features: { storage: '100 GB' } },
        ]}
        features={[{ key: 'storage', label: 'Storage' }]}
      />,
      engine
    );

    expect(await screen.findByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('loads PatternUserProfileCard through the public component', async () => {
    renderWithEngine(
      <PatternUserProfileCard
        user={{
          name: 'Jane Doe',
          role: 'Product Manager',
          email: 'jane@example.com',
          department: 'Engineering',
          status: 'active',
        }}
      />,
      engine
    );

    expect(await screen.findByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Product Manager')).toBeInTheDocument();
  });
});
