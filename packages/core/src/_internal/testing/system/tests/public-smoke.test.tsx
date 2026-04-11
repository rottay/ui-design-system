/**
 * @fileoverview Public component smoke tests across all stable engines.
 * Verifies that every exported primitive (Avatar, Badge, Card, Modal, etc.)
 * renders without throwing through each engine's lazy-loaded implementation.
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';
import * as DS from '../../../../index';
import { STABLE_ENGINES, renderWithEngine } from '../../helpers/engine-test-utils';

const DATA_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="%230066cc"/></svg>';

type SmokeCase = {
  name: string;
  render: () => React.ReactElement;
  portalTarget?: boolean;
  portalText?: string;
};

const SMOKE_CASES: SmokeCase[] = [
  { name: 'Avatar', render: () => <DS.Avatar>AB</DS.Avatar> },
  { name: 'Badge', render: () => <DS.Badge count={3}><span>Inbox</span></DS.Badge> },
  {
    name: 'Card',
    render: () => (
      <DS.Card>
        <DS.Card.Header title="Card title" subtitle="Card subtitle" />
        <DS.Card.Body>Body</DS.Card.Body>
        <DS.Card.Footer>Footer</DS.Card.Footer>
      </DS.Card>
    ),
  },
  {
    name: 'Carousel',
    render: () => (
      <DS.Carousel dots>
        <div>Slide 1</div>
        <div>Slide 2</div>
      </DS.Carousel>
    ),
  },
  {
    name: 'Descriptions',
    render: () => (
      <DS.Descriptions title="Summary">
        <DS.Descriptions.Item label="Name">Daniel</DS.Descriptions.Item>
      </DS.Descriptions>
    ),
  },
  { name: 'Empty', render: () => <DS.Empty description="No content" /> },
  { name: 'Image', render: () => <DS.Image src={DATA_IMAGE} alt="Preview" /> },
  { name: 'QRCode', render: () => <DS.QRCode value="https://rottay.com" /> },
  { name: 'Tag', render: () => <DS.Tag>Active</DS.Tag> },
  {
    name: 'Timeline',
    render: () => <DS.Timeline items={[{ children: 'Created' }, { children: 'Published' }]} />,
  },
  {
    name: 'Tooltip',
    render: () => (
      <DS.Tooltip title="Helpful" open>
        <button type="button">Hover</button>
      </DS.Tooltip>
    ),
  },
  { name: 'Alert', render: () => <DS.Alert message="Saved" description="Changes persisted" /> },
  {
    name: 'Drawer',
    render: () => <DS.Drawer open title="Panel">Drawer body</DS.Drawer>,
    portalTarget: true,
    portalText: 'Drawer body',
  },
  {
    name: 'Modal',
    render: () => <DS.Modal open title="Dialog">Modal body</DS.Modal>,
    portalTarget: true,
    portalText: 'Modal body',
  },
  { name: 'Progress', render: () => <DS.Progress percent={72} /> },
  { name: 'Rate', render: () => <DS.Rate defaultValue={3} /> },
  { name: 'Spinner', render: () => <DS.Spinner spinning /> },
  { name: 'AutoComplete', render: () => <DS.AutoComplete options={[{ value: 'Option A' }]} /> },
  {
    name: 'Cascader',
    render: () => (
      <DS.Cascader
        options={[
          {
            value: 'company',
            label: 'Company',
            children: [{ value: 'engineering', label: 'Engineering' }],
          },
        ]}
      />
    ),
  },
  { name: 'Checkbox', render: () => <DS.Checkbox checked>Accept</DS.Checkbox> },
  { name: 'ColorPicker', render: () => <DS.ColorPicker defaultValue="#0066cc" /> },
  { name: 'DatePicker', render: () => <DS.DatePicker /> },
  { name: 'InputNumber', render: () => <DS.InputNumber defaultValue={5} /> },
  { name: 'Mentions', render: () => <DS.Mentions options={[{ value: 'daniel', label: 'Daniel' }]} /> },
  { name: 'Radio', render: () => <DS.Radio checked>Primary</DS.Radio> },
  { name: 'Slider', render: () => <DS.Slider defaultValue={45} /> },
  { name: 'Switch', render: () => <DS.Switch checked /> },
  { name: 'Textarea', render: () => <DS.Textarea defaultValue="Hello world" /> },
  { name: 'TimePicker', render: () => <DS.TimePicker /> },
  { name: 'Toggle', render: () => <DS.Toggle checked /> },
  {
    name: 'Transfer',
    render: () => (
      <DS.Transfer
        dataSource={[
          { key: '1', title: 'Item 1' },
          { key: '2', title: 'Item 2' },
        ]}
        targetKeys={['2']}
        render={(item) => item.title}
      />
    ),
  },
  {
    name: 'TreeSelect',
    render: () => (
      <DS.TreeSelect
        treeData={[
          {
            value: 'company',
            title: 'Company',
            children: [{ value: 'team', title: 'Team' }],
          },
        ]}
      />
    ),
  },
  {
    name: 'Upload',
    render: () => (
      <DS.Upload beforeUpload={() => false}>
        <button type="button">Upload</button>
      </DS.Upload>
    ),
  },
  {
    name: 'Collapse',
    render: () => <DS.Collapse items={[{ key: '1', label: 'Panel', children: 'Body' }]} />,
  },
  { name: 'Container', render: () => <DS.Container>Container body</DS.Container> },
  { name: 'Divider', render: () => <DS.Divider>Section</DS.Divider> },
  { name: 'Flex', render: () => <DS.Flex><span>A</span><span>B</span></DS.Flex> },
  {
    name: 'Layout',
    render: () => (
      <DS.Layout>
        <DS.Layout.Content>Content</DS.Layout.Content>
      </DS.Layout>
    ),
  },
  { name: 'Space', render: () => <DS.Space><span>A</span><span>B</span></DS.Space> },
  { name: 'Stack', render: () => <DS.Stack><span>A</span><span>B</span></DS.Stack> },
  {
    name: 'Affix',
    render: () => (
      <DS.Affix offsetTop={0}>
        <button type="button">Sticky</button>
      </DS.Affix>
    ),
  },
  {
    name: 'Anchor',
    render: () => <DS.Anchor items={[{ key: 'overview', href: '#overview', title: 'Overview' }]} />,
  },
  { name: 'BackTop', render: () => <DS.BackTop visibilityHeight={0} /> },
  {
    name: 'Breadcrumb',
    render: () => <DS.Breadcrumb items={[{ key: 'home', title: 'Home' }, { key: 'settings', title: 'Settings' }]} />,
  },
  { name: 'Link', render: () => <DS.Link href="/settings">Settings</DS.Link> },
  {
    name: 'Menu',
    render: () => <DS.Menu items={[{ key: 'overview', label: 'Overview' }, { key: 'billing', label: 'Billing' }]} />,
  },
  { name: 'Pagination', render: () => <DS.Pagination current={2} total={100} pageSize={10} onChange={() => undefined} /> },
  { name: 'Segmented', render: () => <DS.Segmented options={['Week', 'Month']} /> },
  {
    name: 'Steps',
    render: () => <DS.Steps items={[{ title: 'Draft' }, { title: 'Review' }, { title: 'Publish' }]} current={1} />,
  },
  {
    name: 'Dropdown',
    render: () => (
      <DS.Dropdown
        open
        trigger={['click']}
        menu={{ items: [{ key: 'edit', label: 'Edit' }, { key: 'archive', label: 'Archive' }] }}
      >
        <button type="button">Open</button>
      </DS.Dropdown>
    ),
  },
  {
    name: 'Popconfirm',
    render: () => (
      <DS.Popconfirm open title="Confirm delete?" onConfirm={() => undefined}>
        <button type="button">Delete</button>
      </DS.Popconfirm>
    ),
  },
  {
    name: 'Popover',
    render: () => (
      <DS.Popover open content="Popover content">
        <button type="button">Info</button>
      </DS.Popover>
    ),
  },
  { name: 'Watermark', render: () => <DS.Watermark content="Rottay"><div>Watermarked</div></DS.Watermark> },
];

describe('public component smoke coverage', () => {
  describe.each(STABLE_ENGINES)('%s engine', (engine) => {
    it.each(SMOKE_CASES)('renders $name through the public API', async ({ render, portalTarget, portalText }) => {
      const result = renderWithEngine(render(), engine);

      await waitFor(() => {
        if (portalTarget) {
          expect(document.body.textContent).toContain(portalText ?? '');
          return;
        }

        expect(result.container.childElementCount).toBeGreaterThan(0);
      });
    });
  });
});
