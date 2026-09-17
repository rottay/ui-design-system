/**
 * @fileoverview Browser entry for the drag-session Chromium fixture. Mounts the
 * scene; every assertion is evaluated by the runner inside the page, against
 * the log the scene publishes on `window.__dragScene`.
 */
/// <reference types="vite/client" />
import React from 'react';
import { createRoot } from 'react-dom/client';

import { DragSessionScene } from '../index';

const host = document.getElementById('root');
if (!host) throw new Error('drag-session runner: #root missing');
createRoot(host).render(<DragSessionScene />);
