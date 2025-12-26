/**
 * Layout - Engine Router (Compound Component)
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type {
  LayoutProps,
  LayoutHeaderProps,
  LayoutSiderProps,
  LayoutContentProps,
  LayoutFooterProps,
} from './types';

export {
  type LayoutProps,
  type LayoutHeaderProps,
  type LayoutSiderProps,
  type LayoutContentProps,
  type LayoutFooterProps,
  LAYOUT_DEFAULTS,
} from './types';

const LayoutBase = createEngineComponent<LayoutProps>('Layout', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Layout })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Layout })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Layout })),
});

const Header = createEngineComponent<LayoutHeaderProps>('Layout.Header', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Header })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Header })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Header })),
});

const Sider = createEngineComponent<LayoutSiderProps>('Layout.Sider', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Sider })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Sider })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Sider })),
});

const Content = createEngineComponent<LayoutContentProps>('Layout.Content', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Content })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Content })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Content })),
});

const Footer = createEngineComponent<LayoutFooterProps>('Layout.Footer', {
  titan: () => import('./engines/titan').then(m => ({ default: m.Footer })),
  hermes: () => import('./engines/hermes').then(m => ({ default: m.Footer })),
  apollo: () => import('./engines/apollo').then(m => ({ default: m.Footer })),
});

export const Layout = Object.assign(LayoutBase, {
  Header,
  Sider,
  Content,
  Footer,
});

export default Layout;
