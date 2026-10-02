/**
 * @fileoverview Real-mount probes: a component's own runtime, bundled in memory
 * from source and mounted with react-dom inside the Chromium probe page.
 *
 * Opt-in per test: the static-markup probes never load this module or esbuild.
 * A bundle that does not boot, a page error, or a scene whose ready element
 * never appears throws; there is no fallback to static markup.
 *
 * @module Tests/Support/family-causality/real-mount
 */

import { resolve } from 'node:path';

import {
  mountArm,
  resolveChromium,
  resolvedBaseCss,
  type ProbeDecisions,
  type ProbePage,
  type ProbeReadings,
  type ProbeTarget,
  type ProbeVertical,
} from '..';

const CORE_ROOT = resolve(__dirname, '../../../..');
const SURFACE_STYLE = 'background: var(--ds-color-bg-primary); color: var(--ds-color-text-primary); padding: 16px;';

export interface RealMountBundleRequest {
  /** Module path under the core root, e.g. `src/components/patterns/.../engines/modern`. */
  readonly module: string;
  /** The module export mounted; `default` when absent. */
  readonly exportName?: string;
  /** A JS expression evaluated inside the bundle: the props every scene starts from. */
  readonly props: string;
  /** Rewrites source files in memory before bundling (a scratch A/B lever); it must change at least one file. */
  readonly transform?: (path: string, source: string) => string | undefined;
}

/** Bundle the module, React and react-dom/client into one in-memory IIFE exposing `window.__dsRealMount`. */
export async function bundleRealMount(request: RealMountBundleRequest): Promise<string> {
  const { build } = await import('esbuild');
  const { readFileSync } = await import('node:fs');
  const modulePath = resolve(CORE_ROOT, request.module);
  const exportName = JSON.stringify(request.exportName ?? 'default');
  let transformed = 0;
  const result = await build({
    stdin: {
      contents: [
        `import React from 'react';`,
        `import { createRoot } from 'react-dom/client';`,
        `import { flushSync } from 'react-dom';`,
        `import * as owner from ${JSON.stringify(modulePath)};`,
        `const Component = owner[${exportName}];`,
        `if (typeof Component !== 'function' && typeof Component !== 'object') throw new Error('real-mount: export ' + ${exportName} + ' is not a component');`,
        `const baseProps = (${request.props});`,
        `window.__dsRealMount = { mount(host, props) {`,
        `  const root = createRoot(host);`,
        `  flushSync(() => root.render(React.createElement(Component, { ...baseProps, ...props })));`,
        `  return () => flushSync(() => root.unmount());`,
        `} };`,
      ].join('\n'),
      resolveDir: CORE_ROOT,
      loader: 'tsx',
    },
    absWorkingDir: CORE_ROOT,
    tsconfig: resolve(CORE_ROOT, 'tsconfig.json'),
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"development"' },
    loader: { '.css': 'empty' },
    logLevel: 'silent',
    plugins: request.transform
      ? [
          {
            name: 'real-mount-transform',
            setup(pluginBuild) {
              pluginBuild.onLoad({ filter: /\/src\/.*\.tsx?$/ }, (args) => {
                const source = readFileSync(args.path, 'utf8');
                const next = request.transform?.(args.path, source);
                if (next === undefined || next === source) return undefined;
                transformed += 1;
                return { contents: next, loader: args.path.endsWith('x') ? 'tsx' : 'ts' };
              });
            },
          },
        ]
      : [],
  });
  if (request.transform && transformed === 0) {
    throw new Error('real-mount: the transform changed no source file');
  }
  return result.outputFiles[0].text;
}

/** Real input on the step's element, dispatched by Playwright so the component's own handlers fire. */
export type RealMountInput =
  | { readonly kind: 'click' }
  | { readonly kind: 'fill'; readonly text: string }
  | { readonly kind: 'press'; readonly key: string };

/** A change applied to the mounted page while the component stays open. */
export interface RealMountStep {
  readonly id: string;
  /** Document-scoped selector of the element that changes; it must match exactly one element. */
  readonly selector: string;
  readonly attributes?: Readonly<Record<string, string>>;
  /** Inline properties set on the element, custom properties included. */
  readonly style?: Readonly<Record<string, string>>;
  /** Applied after the attributes and the style. */
  readonly input?: RealMountInput;
}

/** `property` is a computed property, `@attr.<name>` an attribute, or `@inline.<name>` the element's own inline value. */
export type RealMountTarget = Pick<ProbeTarget, 'id' | 'selector' | 'property'>;

export interface RealMountScene {
  readonly id: string;
  /** Markup around the mount point; the component mounts into its `[data-real-mount]` element. */
  readonly markup: string;
  /** JSON props merged over the bundle's base props. */
  readonly props?: Readonly<Record<string, unknown>>;
  /** Document-scoped selector that must match once mounted, and must not match before. */
  readonly ready: string;
  /** Document-scoped reads, taken after mount and again after every step. */
  readonly targets: readonly RealMountTarget[];
  readonly steps?: readonly RealMountStep[];
}

export interface RealMountRequest {
  readonly vertical: ProbeVertical;
  readonly bundle: string;
  readonly decisions?: ProbeDecisions;
  /** Stylesheets appended after the vertical's arm, e.g. a DB tenant artifact. */
  readonly css?: readonly string[];
  readonly scenes: readonly RealMountScene[];
}

type EventedPage = ProbePage & {
  on(event: 'pageerror', listener: (error: Error) => void): void;
  click(selector: string, options: { timeout: number }): Promise<void>;
  fill(selector: string, value: string, options: { timeout: number }): Promise<void>;
  press(selector: string, key: string, options: { timeout: number }): Promise<void>;
};

const INPUT_TIMEOUT = 5_000;

/**
 * Mount every scene in turn on one page and read its targets after mount and
 * after each step. Readings are keyed by scene id, and by `scene>step` per step.
 */
export async function measureRealMount(request: RealMountRequest): Promise<ProbeReadings> {
  const browser = await resolveChromium().launch();
  const readings: ProbeReadings = {};
  const pageErrors: string[] = [];
  const failOnPageError = (where: string) => {
    if (pageErrors.length > 0) throw new Error(`real-mount: page error ${where}: ${pageErrors.join(' | ')}`);
  };
  try {
    const page = (await (await browser.newContext()).newPage()) as EventedPage;
    page.on('pageerror', (error) => pageErrors.push(String(error)));
    await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'none' });
    await page.setContent('<!doctype html><html><head></head><body></body></html>');
    const arm = await mountArm(request.vertical, request.decisions ?? {});
    await page.addStyleTag({ content: resolvedBaseCss() });
    await page.addStyleTag({ content: arm.css });
    for (const css of request.css ?? []) await page.addStyleTag({ content: css });
    await page.addScriptTag({ content: request.bundle });
    failOnPageError('while booting the bundle');
    const booted = await page.evaluate((rootAttributes: Readonly<Record<string, string>>) => {
      for (const [name, value] of Object.entries(rootAttributes)) document.documentElement.setAttribute(name, value);
      return typeof (window as { __dsRealMount?: { mount?: unknown } }).__dsRealMount?.mount === 'function';
    }, arm.rootAttributes);
    if (!booted) throw new Error('real-mount: the bundle did not expose window.__dsRealMount');

    for (const scene of request.scenes) {
      const mounted = await page.evaluate(
        async ({ scene: current, surface }) => {
          const settle = () => new Promise((done) => requestAnimationFrame(() => setTimeout(done, 30)));
          if (document.querySelector(current.ready)) return `residue: ${current.ready} matched before mount`;
          const host = document.createElement('div');
          host.setAttribute('data-real-mount-host', current.id);
          host.setAttribute('style', surface);
          host.setAttribute('dir', 'ltr');
          host.innerHTML = current.markup;
          document.body.append(host);
          const slot = host.querySelector<HTMLElement>('[data-real-mount]');
          if (!slot) return 'the scene markup has no [data-real-mount] element';
          const realMount = (window as unknown as {
            __dsRealMount: { mount(host: HTMLElement, props: unknown): () => void };
          }).__dsRealMount;
          (window as unknown as { __dsUnmount?: () => void }).__dsUnmount = realMount.mount(slot, current.props ?? {});
          await settle();
          await settle();
          return document.querySelector(current.ready) ? 'ok' : `${current.ready} never appeared`;
        },
        { scene, surface: SURFACE_STYLE },
      );
      failOnPageError(`mounting ${scene.id}`);
      if (mounted !== 'ok') throw new Error(`real-mount: scene ${scene.id} did not boot: ${mounted}`);

      const read = (targets: readonly RealMountTarget[]) =>
        page.evaluate((current: readonly RealMountTarget[]) => {
          const values: Record<string, string> = {};
          for (const target of current) {
            const element = document.querySelector<HTMLElement>(target.selector);
            if (!element) values[target.id] = `<no match: ${target.selector}>`;
            else if (target.property.startsWith('@attr.')) values[target.id] = element.getAttribute(target.property.slice(6)) ?? '<absent>';
            else if (target.property.startsWith('@inline.')) values[target.id] = element.style.getPropertyValue(target.property.slice(8));
            else values[target.id] = getComputedStyle(element).getPropertyValue(target.property);
          }
          return values;
        }, targets);

      readings[scene.id] = await read(scene.targets);
      for (const step of scene.steps ?? []) {
        if (!step.attributes && !step.style && !step.input) {
          throw new Error(`real-mount: step ${scene.id}>${step.id} declares no change`);
        }
        const matches = await page.evaluate(
          (current: RealMountStep) => document.querySelectorAll(current.selector).length,
          step,
        );
        if (matches === 0) throw new Error(`real-mount: step ${scene.id}>${step.id} matched no ${step.selector}`);
        if (matches > 1) {
          throw new Error(`real-mount: step ${scene.id}>${step.id} matched ${matches} elements for ${step.selector}`);
        }
        await page.evaluate((current: RealMountStep) => {
          const element = document.querySelector<HTMLElement>(current.selector);
          for (const [name, value] of Object.entries(current.attributes ?? {})) element?.setAttribute(name, value);
          for (const [name, value] of Object.entries(current.style ?? {})) element?.style.setProperty(name, value);
        }, step);
        const input = step.input;
        if (input?.kind === 'click') await page.click(step.selector, { timeout: INPUT_TIMEOUT });
        else if (input?.kind === 'fill') await page.fill(step.selector, input.text, { timeout: INPUT_TIMEOUT });
        else if (input?.kind === 'press') await page.press(step.selector, input.key, { timeout: INPUT_TIMEOUT });
        await page.evaluate(async () => {
          const settle = () => new Promise((done) => requestAnimationFrame(() => setTimeout(done, 30)));
          await settle();
          await settle();
        }, undefined);
        failOnPageError(`at ${scene.id}>${step.id}`);
        readings[`${scene.id}>${step.id}`] = await read(scene.targets);
      }

      await page.evaluate((id: string) => {
        (window as unknown as { __dsUnmount?: () => void }).__dsUnmount?.();
        document.querySelector(`[data-real-mount-host="${id}"]`)?.remove();
      }, scene.id);
      failOnPageError(`unmounting ${scene.id}`);
    }
    await page.close();
  } finally {
    await browser.close();
  }
  return readings;
}
