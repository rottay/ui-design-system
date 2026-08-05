/**
 * @fileoverview Browser entry for the FAB-17 Chromium fixture. Mounts the scene
 * and publishes the assertion functions on `window` so the Node runner can
 * invoke them inside the page, where a real layout engine exists.
 *
 * The DS stylesheet is imported here on purpose: the submenu negative control
 * is positioned ENTIRELY by the modern skin, so a run without the skin loaded
 * would fail that control for a reason unrelated to the merge order. The runner
 * asserts the stylesheet actually applied before it believes anything.
 */
/// <reference types="vite/client" />
import React from 'react';
import { createRoot } from 'react-dom/client';

import '@/foundation/tokens/css/facade/entrypoints/styles.css';

import {
  Fab17StaticHatchScene,
  runFab17PayloadPotencyControl,
  runFab17Primary,
  runFab17SubmenuControl,
  MARK,
  HATCH_WITNESS_PROPERTY,
} from '../index';

const api = {
  runPayloadPotencyControl: runFab17PayloadPotencyControl,
  runPrimary: runFab17Primary,
  runSubmenuControl: runFab17SubmenuControl,
  MARK,
  HATCH_WITNESS_PROPERTY,
};

(window as unknown as Record<string, unknown>).__FAB17__ = api;

const host = document.getElementById('root');
if (!host) throw new Error('FAB-17 runner: #root missing');
createRoot(host).render(<Fab17StaticHatchScene />);
