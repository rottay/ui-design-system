/**
 * @fileoverview Browser entry for the pointer-session Chromium fixture. Mounts the
 * scene; every assertion is evaluated by the runner inside the page, against
 * the log the scene publishes on `window.__pointerScene`.
 */
/// <reference types="vite/client" />
import React from 'react';
import { createRoot } from 'react-dom/client';

import { PointerSessionScene } from '../index';

const host = document.getElementById('root');
if (!host) throw new Error('pointer-session runner: #root missing');
createRoot(host).render(<PointerSessionScene />);
