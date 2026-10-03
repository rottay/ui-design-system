import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { DesignSystemProvider, getKnownTenantConfig } from '@rottay/design-system';
import PostureListPage from '../posture-list-page';

export interface PostureBrowserConfig {
  viewport: 'phone' | 'tablet' | 'desktop';
  disabled: boolean;
  theme: string;
}

export interface PostureBrowserAnatomy {
  columnMenu: number;
  previewRail: number;
  bottomBar: number;
  floating: number;
  sidebar: number;
  bottomNavigation: number;
  primaryActions: number;
  posture: string | null;
  columnMenuText: boolean;
  previewRailText: boolean;
}

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

interface ElementPaint {
  display: string;
  visibility: string;
  position: string;
  rect: Rect;
}

interface HitSample {
  name: string;
  x: number;
  y: number;
  matchesAction: boolean;
  target: string | null;
  targetRect: Rect | null;
}

interface ScrollSnapshot {
  actionRect: Rect;
  viewport: { width: number; height: number };
  windowScroll: { x: number; y: number };
  ancestors: {
    target: string;
    rect: Rect;
    scrollLeft: number;
    scrollTop: number;
    clientWidth: number;
    clientHeight: number;
    scrollWidth: number;
    scrollHeight: number;
    overflowX: string;
    overflowY: string;
    position: string;
    transform: string;
    contain: string;
    clipPath: string;
  }[];
}

interface BoxDiagnostics {
  target: string;
  rect: Rect;
  offsetHeight: number;
  height: string;
  minBlockSize: string;
  paddingBlockStart: string;
  paddingBlockEnd: string;
  paddingInlineStart: string;
  paddingInlineEnd: string;
  borderBlockStartWidth: string;
  borderBlockEndWidth: string;
  lineHeight: string;
  font: string;
  fontSize: string;
  fontFamily: string;
  boxSizing: string;
  transform: string;
}

export interface PostureBrowserResult {
  viewport: { width: number; height: number };
  prepaint: PostureBrowserAnatomy;
  hydrated: PostureBrowserAnatomy;
  hiddenChromeInsertions: number;
  hydrationErrors: string[];
  dock: { mode: string | null; position: string; rect: Rect } | null;
  chrome: {
    columnMenu: ElementPaint | null;
    previewRail: ElementPaint | null;
  };
  navigation: {
    bottomBar: ElementPaint | null;
    sidebar: ElementPaint | null;
    drawerTrigger: ElementPaint | null;
  };
  density: {
    posture: string | null;
    paddingInlineStart: number;
    paddingInlineEnd: number;
    minBlockSize: number;
    fontSize: number;
    consumerRect: Rect;
    buttonBox: BoxDiagnostics;
    internalContent: BoxDiagnostics[];
    activeAnimations: {
      target: string;
      type: string;
      name: string;
      playState: string;
      currentTime: string | null;
      startTime: string | null;
      duration: string;
      progress: number | null;
      localTime: string | null;
    }[];
  };
  action: {
    disabled: boolean;
    rect: Rect;
    fullyHitTestable: boolean;
    callbackCount: number;
    borderRadii: { corner: string; computed: string; x: number; y: number }[];
    hitSamples: HitSample[];
    boundingCornerSamples: HitSample[];
    scroll: { requested: boolean; before: ScrollSnapshot; after: ScrollSnapshot };
  };
}

const ROWS = [
  { id: '1', label: 'Senior designer' },
  { id: '2', label: 'Platform engineer' },
] as const;

const TENANT = getKnownTenantConfig('rottay');
if (!TENANT) throw new Error('The canonical Rottay first-party tenant is unavailable.');

export function PostureBrowserPage({
  viewport,
  disabled,
  theme,
  onCreate,
}: PostureBrowserConfig & { onCreate?: () => void }) {
  return (
    <DesignSystemProvider tenantConfig={TENANT} forceEngine="modern" forceTheme={theme} ssrViewport={viewport}>
      <PostureListPage rows={ROWS} onCreate={onCreate} actionDisabled={disabled} />
    </DesignSystemProvider>
  );
}

function anatomy(): PostureBrowserAnatomy {
  const count = (selector: string) => document.querySelectorAll(selector).length;
  return {
    columnMenu: count('[data-surface-region="column-menu"]'),
    previewRail: count('[data-surface-region="preview-rail"]'),
    bottomBar: count('[data-surface-region="bottom-bar"]'),
    floating: count('[data-surface-region="floating"]'),
    sidebar: count('[data-part="navigation-sidebar"]'),
    bottomNavigation: count('[data-part="navigation-bottom-bar"]'),
    primaryActions: Array.from(document.querySelectorAll('button')).filter(
      (button) => button.textContent?.trim() === 'New role',
    ).length,
    posture: document.querySelector('[data-surface-region="results"]')?.getAttribute('data-posture') ?? null,
    columnMenuText: document.getElementById('root')?.textContent?.includes('All columns') ?? false,
    previewRailText: document.getElementById('root')?.textContent?.includes('Preview rail body') ?? false,
  };
}

function rect(element: Element): Rect {
  const { left, top, right, bottom, width, height } = element.getBoundingClientRect();
  return { left, top, right, bottom, width, height };
}

function elementDescription(element: Element): string {
  return `${element.localName}${element.id ? `#${element.id}` : ''}.${element.getAttribute('class') ?? ''}[data-part=${element.getAttribute('data-part') ?? ''}][data-surface-region=${element.getAttribute('data-surface-region') ?? ''}]`;
}

function boxDiagnostics(element: HTMLElement): BoxDiagnostics {
  const style = getComputedStyle(element);
  return {
    target: elementDescription(element), rect: rect(element), offsetHeight: element.offsetHeight,
    height: style.height, minBlockSize: style.minBlockSize,
    paddingBlockStart: style.paddingBlockStart, paddingBlockEnd: style.paddingBlockEnd,
    paddingInlineStart: style.paddingInlineStart, paddingInlineEnd: style.paddingInlineEnd,
    borderBlockStartWidth: style.borderBlockStartWidth, borderBlockEndWidth: style.borderBlockEndWidth,
    lineHeight: style.lineHeight, font: style.font, fontSize: style.fontSize, fontFamily: style.fontFamily,
    boxSizing: style.boxSizing, transform: style.transform,
  };
}

function scrollSnapshot(action: HTMLButtonElement): ScrollSnapshot {
  const ancestors: ScrollSnapshot['ancestors'] = [];
  for (let ancestor = action.parentElement; ancestor; ancestor = ancestor.parentElement) {
    const style = getComputedStyle(ancestor);
    if (
      ancestor === document.body || ancestor === document.documentElement ||
      ancestor.scrollHeight > ancestor.clientHeight || ancestor.scrollWidth > ancestor.clientWidth ||
      style.overflowX !== 'visible' || style.overflowY !== 'visible' ||
      style.position !== 'static' || style.transform !== 'none' ||
      style.contain !== 'none' || style.clipPath !== 'none' ||
      ancestor.hasAttribute('data-part') || ancestor.hasAttribute('data-surface-region')
    ) {
      ancestors.push({
        target: elementDescription(ancestor), rect: rect(ancestor),
        scrollLeft: ancestor.scrollLeft, scrollTop: ancestor.scrollTop,
        clientWidth: ancestor.clientWidth, clientHeight: ancestor.clientHeight,
        scrollWidth: ancestor.scrollWidth, scrollHeight: ancestor.scrollHeight,
        overflowX: style.overflowX, overflowY: style.overflowY,
        position: style.position, transform: style.transform,
        contain: style.contain, clipPath: style.clipPath,
      });
    }
  }
  return {
    actionRect: rect(action), viewport: { width: innerWidth, height: innerHeight },
    windowScroll: { x: scrollX, y: scrollY }, ancestors,
  };
}

function startProbe() {
  const host = document.getElementById('root')!;
  const config: PostureBrowserConfig = JSON.parse(document.getElementById('probe-config')!.textContent!);
  const prepaint = anatomy();
  let callbackCount = 0;
  let hiddenChromeInsertions = 0;
  const hydrationErrors: string[] = [];
  const hiddenSelector = '[data-surface-region="column-menu"], [data-surface-region="preview-rail"]';
  const observer = new MutationObserver((records) => {
    if (config.viewport !== 'phone') return;
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof Element && (node.matches(hiddenSelector) || node.querySelector(hiddenSelector))) {
          hiddenChromeInsertions += 1;
        }
      }
    }
  });
  observer.observe(host, { childList: true, subtree: true });
  const root = hydrateRoot(host, <PostureBrowserPage {...config} onCreate={() => { callbackCount += 1; }} />, {
    onRecoverableError: (error) => hydrationErrors.push(String(error)),
  });
  let attempts = 0;
  const measure = () => {
    const action = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'New role',
    );
    if (!action || !host.querySelector('.ds-list') || action.getBoundingClientRect().height === 0) {
      if (++attempts < 100) return setTimeout(measure, 50);
      document.documentElement.setAttribute('data-probe-error', 'ListSurface action never became measurable');
      observer.disconnect();
      root.unmount();
      return;
    }
    const beforeScroll = scrollSnapshot(action);
    const initial = beforeScroll.actionRect;
    const scrollRequested = initial.left < 0 || initial.top < 0 ||
      initial.right > beforeScroll.viewport.width || initial.bottom > beforeScroll.viewport.height;
    if (scrollRequested) action.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
    setTimeout(() => {
      const afterScroll = scrollSnapshot(action);
      const actionRect = rect(action);
      const dock = action.closest('.ds-action-dock');
      const actionStyle = getComputedStyle(action);
      const layoutWidth = action.offsetWidth;
      const layoutHeight = action.offsetHeight;
      const radiusLength = (value: string, size: number) => {
        if (!/^(?:\d+(?:\.\d+)?|\.\d+)(?:px|%)$/.test(value)) {
          throw new Error(`Unmeasurable computed Button border radius: ${value}`);
        }
        return parseFloat(value) * (value.endsWith('%') ? size / 100 : 1);
      };
      const borderRadii = [
        ['top-left', actionStyle.borderTopLeftRadius],
        ['top-right', actionStyle.borderTopRightRadius],
        ['bottom-left', actionStyle.borderBottomLeftRadius],
        ['bottom-right', actionStyle.borderBottomRightRadius],
      ].map(([corner, computed]) => {
        const [horizontal, vertical = horizontal] = computed!.split(/\s+/);
        return {
          corner: corner!, computed: computed!,
          x: radiusLength(horizontal!, layoutWidth),
          y: radiusLength(vertical!, layoutHeight),
        };
      });
      const [topLeft, topRight, bottomLeft, bottomRight] = borderRadii;
      const radiusScale = Math.min(
        1,
        layoutWidth / (topLeft!.x + topRight!.x),
        layoutWidth / (bottomLeft!.x + bottomRight!.x),
        layoutHeight / (topLeft!.y + bottomLeft!.y),
        layoutHeight / (topRight!.y + bottomRight!.y),
      );
      for (const radius of borderRadii) {
        radius.x *= radiusScale * actionRect.width / layoutWidth;
        radius.y *= radiusScale * actionRect.height / layoutHeight;
      }
      const sample = (name: string, x: number, y: number): HitSample => {
        const hit = document.elementFromPoint(x, y);
        const target = hit ? [hit, hit.parentElement].filter(Boolean).map((element) => elementDescription(element!)).join(' < ') : null;
        return {
          name, x, y,
          matchesAction: hit === action || (hit !== null && action.contains(hit)),
          target, targetRect: hit ? rect(hit) : null,
        };
      };
      const centerX = actionRect.left + actionRect.width / 2;
      const centerY = actionRect.top + actionRect.height / 2;
      const hitSamples = [
        sample('center', centerX, centerY),
        sample('top-edge', centerX, actionRect.top + 2),
        sample('right-edge', actionRect.right - 2, centerY),
        sample('bottom-edge', centerX, actionRect.bottom - 2),
        sample('left-edge', actionRect.left + 2, centerY),
      ];
      const boundingCornerSamples = borderRadii.map((radius) => {
        const right = radius.corner.endsWith('right');
        const bottom = radius.corner.startsWith('bottom');
        // The ellipse's diagonal boundary is r * (1 - sqrt(1/2)) from its box corner.
        const insetX = Math.min(actionRect.width / 2, radius.x * (1 - Math.SQRT1_2) + 2);
        const insetY = Math.min(actionRect.height / 2, radius.y * (1 - Math.SQRT1_2) + 2);
        hitSamples.push(sample(
          radius.corner,
          right ? actionRect.right - insetX : actionRect.left + insetX,
          bottom ? actionRect.bottom - insetY : actionRect.top + insetY,
        ));
        return sample(
          radius.corner,
          right ? actionRect.right - 2 : actionRect.left + 2,
          bottom ? actionRect.bottom - 2 : actionRect.top + 2,
        );
      });
      const fullyHitTestable = hitSamples.every(({ matchesAction }) => matchesAction);
      const buttonBox = boxDiagnostics(action);
      const internalContent = [...action.querySelectorAll<HTMLElement>(
        '[data-part="content"], [data-part="content-frame"], [data-part="label"]',
      )].map(boxDiagnostics);
      const activeAnimations: PostureBrowserResult['density']['activeAnimations'] = [];
      for (let element: Element | null = action; element; element = element.parentElement) {
        for (const animation of element.getAnimations()) {
          if (animation.playState !== 'running' && animation.playState !== 'paused') continue;
          const timing = animation.effect?.getComputedTiming();
          activeAnimations.push({
            target: elementDescription(element), type: animation.constructor.name,
            name: animation instanceof CSSAnimation ? animation.animationName
              : animation instanceof CSSTransition ? animation.transitionProperty : animation.id,
            playState: animation.playState,
            currentTime: animation.currentTime === null ? null : String(animation.currentTime),
            startTime: animation.startTime === null ? null : String(animation.startTime),
            duration: String(timing?.duration), progress: timing?.progress ?? null,
            localTime: timing?.localTime === null || timing?.localTime === undefined ? null : String(timing.localTime),
          });
        }
      }
      action.click();
      const elementPaint = (selector: string): ElementPaint | null => {
        const element = host.querySelector(selector);
        if (!element) return null;
        const style = getComputedStyle(element);
        return { display: style.display, visibility: style.visibility, position: style.position, rect: rect(element) };
      };
      const result: PostureBrowserResult = {
        viewport: { width: innerWidth, height: innerHeight },
        prepaint,
        hydrated: anatomy(),
        hiddenChromeInsertions,
        hydrationErrors,
        dock: dock ? { mode: dock.getAttribute('data-mode'), position: getComputedStyle(dock).position, rect: rect(dock) } : null,
        chrome: {
          columnMenu: elementPaint('[data-surface-region="column-menu"]'),
          previewRail: elementPaint('[data-surface-region="preview-rail"]'),
        },
        navigation: {
          bottomBar: elementPaint('[data-part="navigation-bottom-bar"]'),
          sidebar: elementPaint('[data-part="navigation-sidebar"]'),
          drawerTrigger: elementPaint('[data-part="navigation-trigger"]'),
        },
        density: {
          posture: action.closest('[data-density]')?.getAttribute('data-density') ?? null,
          paddingInlineStart: parseFloat(actionStyle.paddingInlineStart),
          paddingInlineEnd: parseFloat(actionStyle.paddingInlineEnd),
          minBlockSize: parseFloat(actionStyle.minBlockSize),
          fontSize: parseFloat(actionStyle.fontSize),
          consumerRect: actionRect,
          buttonBox, internalContent, activeAnimations,
        },
        action: {
          disabled: action.disabled, rect: actionRect, fullyHitTestable, callbackCount,
          borderRadii, hitSamples, boundingCornerSamples,
          scroll: { requested: scrollRequested, before: beforeScroll, after: afterScroll },
        },
      };
      document.documentElement.setAttribute('data-probe-result', JSON.stringify(result));
      observer.disconnect();
    }, 500);
  };
  setTimeout(measure, 1000);
}

if (typeof document !== 'undefined' && document.getElementById('probe-config')) startProbe();
