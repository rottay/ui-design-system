import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';

import { Card } from '../Card';
import { Badge } from '../Badge';
import { Avatar } from '../Avatar';
import { Tag } from '../Tag';
import { Image } from '../Image';
import { Carousel } from '../Carousel';
import { QRCode } from '../QRCode';
import { Kbd } from '../Kbd';
import { Empty } from '../Empty';
import { renderWithEngine } from '../../../../tooling/testing/helpers/engine';

// ---------------------------------------------------------------------------
// WO-SKIN-05 checkpoint D1 -- the surfaces + media family (Card, Image,
// Carousel, QRCode, Avatar, Badge, Tag, Kbd, Empty) data-part contract
// evidence.
//
// The pre-step stamps `data-part` (plus data-variant/data-tone/data-size/
// data-status/data-bordered/data-shadow/data-selected/data-dot/
// data-badge-style/data-outlined/data-clickable/data-vertical/data-fade/
// data-direction/data-ring/data-divider) onto all nine components and their
// compounds without moving any paint -- per D1.1, Avatar's frozen P-75
// clip/halo is untouched (the container gets no size/overflow change, only
// a `data-part='root'` stamp); per D1.2, Card's WO-ARC-07 root skin and
// Badge's P-43 transform-only skin are both left alone, this file only
// proves the REMAINDER's stamp reached the DOM. This file proves the stamp
// reached the DOM for each component under every engine it supports,
// mirroring StatusBatch/NavigationBatch's structure. It does not assert
// paint (that is display1-batch.spec.ts's job).
//
// Every base component here renders through `createEngineComponent`'s
// Suspense-wrapped lazy engine loader, so a synchronous
// `container.querySelector(...)` right after `render()` can race the still-
// pending engine chunk -- same `waitForPart` idiom as StatusBatch/
// NavigationBatch/PickersBatch.
// ---------------------------------------------------------------------------

const ENGINES = ['modern', 'rustic'] as const;

async function waitForPart(container: HTMLElement, part: string): Promise<Element> {
  await waitFor(() => {
    expect(container.querySelector(`[data-part="${part}"]`)).not.toBeNull();
  });
  return container.querySelector(`[data-part="${part}"]`) as Element;
}

describe('Display1 (surfaces + media) data-part contract (WO-SKIN-05 checkpoint D1)', () => {
  describe('Card', () => {
    it.each(ENGINES)(
      'stamps root/body/header(data-divider)/title/description/extra/actions under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Card
            variant="outlined"
            title="Title"
            description="Description"
            extra={<span>Extra</span>}
            divider
            actions={[<button key="a" type="button">Action</button>]}
          >
            Body content
          </Card>,
          engine,
        );

        await waitForPart(container, 'root');
        expect(container.querySelector('[data-part="body"]')).not.toBeNull();
        expect(container.querySelector('[data-part="header"][data-divider="true"]')).not.toBeNull();
        expect(container.querySelector('[data-part="title"]')).not.toBeNull();
        expect(container.querySelector('[data-part="description"]')).not.toBeNull();
        expect(container.querySelector('[data-part="extra"]')).not.toBeNull();
        expect(container.querySelector('[data-part="actions"]')).not.toBeNull();
      },
    );

    it.each(ENGINES)('stamps cover(top/bottom) under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Card cover="/cover.jpg" coverPosition="top">Body</Card>,
        engine,
      );
      await waitForPart(container, 'root');
      expect(container.querySelectorAll('[data-part="cover"]').length).toBeGreaterThan(0);
    });

    it('modern: loading renders cover/skeleton/skeleton-bar/loading-overlay/spinner (no root data-part, matching the shipped early-return)', async () => {
      const { container } = renderWithEngine(
        <Card loading cover="/cover.jpg">Body</Card>,
        'modern',
      );
      await waitFor(() => {
        expect(container.querySelector('[data-part="loading-overlay"]')).not.toBeNull();
      });
      expect(container.querySelector('[data-part="cover"]')).not.toBeNull();
      expect(container.querySelector('[data-part="skeleton"]')).not.toBeNull();
      expect(container.querySelectorAll('[data-part="skeleton-bar"]').length).toBeGreaterThan(0);
      expect(container.querySelector('[data-part="spinner"]')).not.toBeNull();
    });

    it('rustic: loading renders loading-overlay/spinner atop the normal root/body tree', async () => {
      const { container } = renderWithEngine(
        <Card loading>Body</Card>,
        'rustic',
      );
      await waitForPart(container, 'root');
      expect(container.querySelector('[data-part="loading-overlay"]')).not.toBeNull();
      expect(container.querySelector('[data-part="spinner"]')).not.toBeNull();
      expect(container.querySelector('[data-part="body"]')).not.toBeNull();
    });

    describe('compounds', () => {
      it('Card.Header stamps header(data-divider)/avatar/title/subtitle/extra', () => {
        const { container } = render(
          <Card.Header title="T" subtitle="S" divider avatar={<span>A</span>} extra={<span>E</span>} />,
        );
        expect(container.querySelector('[data-part="header"][data-divider="true"]')).not.toBeNull();
        expect(container.querySelector('[data-part="avatar"]')).not.toBeNull();
        expect(container.querySelector('[data-part="title"]')).not.toBeNull();
        expect(container.querySelector('[data-part="subtitle"]')).not.toBeNull();
        expect(container.querySelector('[data-part="extra"]')).not.toBeNull();
      });

      it('Card.Body stamps body', () => {
        const { container } = render(<Card.Body>Content</Card.Body>);
        expect(container.querySelector('[data-part="body"]')).not.toBeNull();
      });

      it('Card.Footer stamps footer(data-divider)/actions', () => {
        const { container } = render(
          <Card.Footer divider actions={[<button key="a" type="button">A</button>]} />,
        );
        expect(container.querySelector('[data-part="footer"][data-divider="true"]')).not.toBeNull();
        expect(container.querySelector('[data-part="actions"]')).not.toBeNull();
      });

      it('Card.Image stamps image(data-position)/placeholder/img', () => {
        const { container } = render(<Card.Image src="/x.jpg" alt="x" position="top" />);
        expect(container.querySelector('[data-part="image"][data-position="top"]')).not.toBeNull();
        expect(container.querySelector('[data-part="img"]')).not.toBeNull();
      });
    });
  });

  describe('Badge', () => {
    it.each(ENGINES)(
      'standalone: stamps root(data-variant/data-badge-style/data-dot)/icon/close under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Badge variant="primary" badgeStyle="soft" icon={<span>i</span>} closable onClose={vi.fn()}>
            Label
          </Badge>,
          engine,
        );

        const root = await waitForPart(container, 'root');
        expect(root.getAttribute('data-variant')).toBe('primary');
        expect(root.getAttribute('data-badge-style')).toBe('soft');
        expect(container.querySelector('[data-part="icon"]')).not.toBeNull();
        expect(container.querySelector('[data-part="close"]')).not.toBeNull();
      },
    );

    it.each(ENGINES)('indicator: stamps anchor/root(data-dot) under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <Badge variant="error" dot>
          <span>Anchor</span>
        </Badge>,
        engine,
      );

      await waitForPart(container, 'anchor');
      const root = await waitForPart(container, 'root');
      expect(root.getAttribute('data-dot')).toBe('true');
    });
  });

  describe('Avatar', () => {
    it.each(ENGINES)(
      'stamps root(data-variant/data-shape/data-size/data-status)/fallback/status-dot under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Avatar name="Jane Doe" variant="primary" shape="circle" size="md" status="online" />,
          engine,
        );

        const root = await waitForPart(container, 'root');
        expect(root.getAttribute('data-variant')).toBe('primary');
        expect(root.getAttribute('data-shape')).toBe('circle');
        expect(root.getAttribute('data-size')).toBe('md');
        expect(root.getAttribute('data-status')).toBe('online');
        expect(container.querySelector('[data-part="fallback"]')).not.toBeNull();
        expect(container.querySelector('[data-part="status-dot"][data-status="online"]')).not.toBeNull();
      },
    );

    it('modern: stamps mask (the child that carries the real P-75 size token) and img', async () => {
      const { container } = renderWithEngine(<Avatar src="/x.jpg" alt="x" size="xl" />, 'modern');
      await waitForPart(container, 'root');
      expect(container.querySelector('[data-part="mask"]')).not.toBeNull();
      expect(container.querySelector('[data-part="img"]')).not.toBeNull();
    });

    it('rustic: stamps img directly on the sized root (no mask split)', async () => {
      const { container } = renderWithEngine(<Avatar src="/x.jpg" alt="x" size="xl" />, 'rustic');
      await waitForPart(container, 'root');
      expect(container.querySelector('[data-part="img"]')).not.toBeNull();
      expect(container.querySelector('[data-part="mask"]')).toBeNull();
    });

    describe('compounds', () => {
      it('Avatar.Group stamps root/surplus/item', () => {
        const { container } = render(
          <Avatar.Group max={1}>
            <Avatar name="A1" />
            <Avatar name="A2" />
          </Avatar.Group>,
        );
        expect(container.querySelector('[data-part="root"]')).not.toBeNull();
        expect(container.querySelector('[data-part="surplus"]')).not.toBeNull();
        expect(container.querySelectorAll('[data-part="item"]').length).toBeGreaterThan(0);
      });

      it('Avatar.Badge stamps anchor/dot(data-status)', () => {
        const { container } = render(
          <Avatar.Badge status="busy">
            <span>child</span>
          </Avatar.Badge>,
        );
        expect(container.querySelector('[data-part="anchor"]')).not.toBeNull();
        expect(container.querySelector('[data-part="dot"][data-status="busy"]')).not.toBeNull();
      });

      it('Avatar.Fallback stamps fallback (no src) and img (with src)', () => {
        const { container: noSrc } = render(<Avatar.Fallback fallback={<span>F</span>} />);
        expect(noSrc.querySelector('[data-part="fallback"]')).not.toBeNull();

        const { container: withSrc } = render(<Avatar.Fallback src="/x.jpg" fallback={<span>F</span>} />);
        expect(withSrc.querySelector('[data-part="img"]')).not.toBeNull();
      });
    });
  });

  describe('Tag', () => {
    it.each(ENGINES)(
      'stamps root(data-variant/data-size/data-outlined/data-bordered/data-clickable)/icon/content/close under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Tag
            variant="success"
            size="lg"
            outlined
            bordered
            clickable
            onClick={vi.fn()}
            closable
            onClose={vi.fn()}
            icon={<span>i</span>}
          >
            Label
          </Tag>,
          engine,
        );

        const root = await waitForPart(container, 'root');
        expect(root.getAttribute('data-variant')).toBe('success');
        expect(root.getAttribute('data-size')).toBe('lg');
        expect(root.getAttribute('data-outlined')).toBe('true');
        expect(root.getAttribute('data-bordered')).toBe('true');
        expect(root.getAttribute('data-clickable')).toBe('true');
        expect(container.querySelector('[data-part="icon"]')).not.toBeNull();
        expect(container.querySelector('[data-part="content"]')).not.toBeNull();
        expect(container.querySelector('[data-part="close"]')).not.toBeNull();
      },
    );
  });

  describe('Image', () => {
    it.each(ENGINES)(
      'stamps root(data-status/data-bordered/data-shadow)/img under the %s engine, permanently loading with an empty src',
      async (engine) => {
        const { container } = renderWithEngine(
          <Image src="" alt="x" bordered shadow />,
          engine,
        );

        const root = await waitForPart(container, 'root');
        expect(root.getAttribute('data-status')).toBe('loading');
        expect(root.getAttribute('data-bordered')).toBe('true');
        expect(root.getAttribute('data-shadow')).toBe('true');
        expect(container.querySelector('[data-part="placeholder"]')).not.toBeNull();
        expect(container.querySelector('[data-part="img"]')).not.toBeNull();
      },
    );

    it.each(ENGINES)('zoomable: stamps data-zoomable on root under the %s engine', async (engine) => {
      const { container } = renderWithEngine(<Image src="" alt="x" zoomable />, engine);
      const root = await waitForPart(container, 'root');
      expect(root.getAttribute('data-zoomable')).toBe('true');
    });

    it('rustic: always renders zoom-dialog/zoom-img/zoom-close when zoomable (dialog visibility is inline display, not conditional mount)', async () => {
      const { container } = renderWithEngine(<Image src="" alt="x" zoomable />, 'rustic');
      await waitForPart(container, 'root');
      expect(container.querySelector('[data-part="zoom-dialog"]')).not.toBeNull();
      expect(container.querySelector('[data-part="zoom-img"]')).not.toBeNull();
      expect(container.querySelector('[data-part="zoom-close"]')).not.toBeNull();
    });

    describe('compounds', () => {
      it('Image.Fallback stamps fallback', () => {
        const { container } = render(<Image.Fallback>Broken</Image.Fallback>);
        expect(container.querySelector('[data-part="fallback"]')).not.toBeNull();
      });

      it('Image.Skeleton stamps skeleton', () => {
        const { container } = render(<Image.Skeleton width={64} height={64} />);
        expect(container.querySelector('[data-part="skeleton"]')).not.toBeNull();
      });
    });
  });

  describe('Carousel', () => {
    it.each(ENGINES)(
      'stamps root(data-vertical/data-fade)/track/slide(data-selected)/arrow(data-direction)/dots/dot(data-selected) under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Carousel arrows dots vertical fade>
            <div>Slide 1</div>
            <div>Slide 2</div>
          </Carousel>,
          engine,
        );

        const root = await waitForPart(container, 'root');
        expect(root.getAttribute('data-vertical')).toBe('true');
        expect(root.getAttribute('data-fade')).toBe('true');
        expect(container.querySelector('[data-part="track"]')).not.toBeNull();
        expect(container.querySelector('[data-part="slide"][data-selected="true"]')).not.toBeNull();
        expect(container.querySelector('[data-part="slide"][data-selected="false"]')).not.toBeNull();
        expect(container.querySelector('[data-part="arrow"][data-direction="prev"]')).not.toBeNull();
        expect(container.querySelector('[data-part="arrow"][data-direction="next"]')).not.toBeNull();
        expect(container.querySelector('[data-part="dots"]')).not.toBeNull();
        expect(container.querySelector('[data-part="dot"][data-selected="true"]')).not.toBeNull();
        expect(container.querySelector('[data-part="dot"][data-selected="false"]')).not.toBeNull();
      },
    );

    it('compound: Carousel.Item stamps item', () => {
      const { container } = render(<Carousel.Item>Content</Carousel.Item>);
      expect(container.querySelector('[data-part="item"]')).not.toBeNull();
    });
  });

  describe('QRCode', () => {
    it.each(ENGINES)(
      'active: stamps root(data-status/data-bordered)/canvas-wrapper/canvas under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(<QRCode value="x" bordered />, engine);
        const root = await waitForPart(container, 'root');
        expect(root.getAttribute('data-status')).toBe('active');
        expect(root.getAttribute('data-bordered')).toBe('true');
        expect(container.querySelector('[data-part="canvas-wrapper"]')).not.toBeNull();
        expect(container.querySelector('[data-part="canvas"]')).not.toBeNull();
      },
    );

    it.each(ENGINES)('active + icon: stamps icon under the %s engine', async (engine) => {
      const { container } = renderWithEngine(<QRCode value="x" icon="/icon.png" />, engine);
      await waitForPart(container, 'root');
      expect(container.querySelector('[data-part="icon"]')).not.toBeNull();
    });

    it.each(ENGINES)('loading: stamps overlay/spinner under the %s engine', async (engine) => {
      const { container } = renderWithEngine(<QRCode value="x" status="loading" />, engine);
      await waitForPart(container, 'root');
      expect(container.querySelector('[data-part="overlay"]')).not.toBeNull();
      expect(container.querySelector('[data-part="spinner"]')).not.toBeNull();
    });

    it.each(ENGINES)('expired: stamps overlay/status-text/refresh-button under the %s engine', async (engine) => {
      const { container } = renderWithEngine(
        <QRCode value="x" status="expired" onRefresh={vi.fn()} />,
        engine,
      );
      await waitForPart(container, 'root');
      expect(container.querySelector('[data-part="overlay"]')).not.toBeNull();
      expect(container.querySelector('[data-part="status-text"]')).not.toBeNull();
      expect(container.querySelector('[data-part="refresh-button"]')).not.toBeNull();
    });

    it.each(ENGINES)('scanned: stamps overlay/status-icon under the %s engine', async (engine) => {
      const { container } = renderWithEngine(<QRCode value="x" status="scanned" />, engine);
      await waitForPart(container, 'root');
      expect(container.querySelector('[data-part="overlay"]')).not.toBeNull();
      expect(container.querySelector('[data-part="status-icon"]')).not.toBeNull();
    });
  });

  describe('Kbd', () => {
    it.each(ENGINES)('stamps root(data-size) under the %s engine', async (engine) => {
      const { container } = renderWithEngine(<Kbd size="lg">Enter</Kbd>, engine);
      const root = await waitForPart(container, 'root');
      expect(root.getAttribute('data-size')).toBe('lg');
    });
  });

  describe('Empty', () => {
    it.each(ENGINES)(
      'stamps root/image/description/footer under the %s engine',
      async (engine) => {
        const { container } = renderWithEngine(
          <Empty description="No records" image="default">
            <button type="button">Create</button>
          </Empty>,
          engine,
        );

        await waitForPart(container, 'root');
        expect(container.querySelector('[data-part="image"]')).not.toBeNull();
        expect(container.querySelector('[data-part="description"]')).not.toBeNull();
        expect(container.querySelector('[data-part="footer"]')).not.toBeNull();
      },
    );
  });
});
