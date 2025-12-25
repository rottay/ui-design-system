import { Layout as AntLayout } from 'antd';

// Re-export Layout with all its subcomponents
export const Layout = Object.assign(AntLayout, {
  Header: AntLayout.Header,
  Footer: AntLayout.Footer,
  Content: AntLayout.Content,
  Sider: AntLayout.Sider,
});

// Export type separately
export type { LayoutProps } from 'antd';
