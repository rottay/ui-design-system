/**
 * @fileoverview Browser entry for the widget-board kernel scene: the source DS stylesheet, the
 * bithire tenant artifact and the root attributes a bithire mount projects, then the scene.
 */
/// <reference types="vite/client" />
import React from 'react';
import { createRoot } from 'react-dom/client';

import '@/foundation/tokens/css/facade/entrypoints/base/index.css';
import '@/foundation/tokens/css/facade/artifacts/bithire/index.css';

import { KernelBoardScene } from '../index';

const ROOT_ATTRIBUTES: Record<string, string> = {
  'data-theme': 'light',
  'data-tenant-theme-mode': 'light',
  'data-engine': 'modern',
  lang: 'en',
  dir: 'ltr',
  'data-ds-root': '',
  'data-vertical': 'bithire',
  'data-tenant': 'bithire',
};
for (const [name, value] of Object.entries(ROOT_ATTRIBUTES)) document.documentElement.setAttribute(name, value);

const host = document.getElementById('root');
if (!host) throw new Error('kernel-board runner: #root missing');
const catalog = new URLSearchParams(window.location.search).get('catalog') === '1';
createRoot(host).render(<KernelBoardScene catalog={catalog} />);
