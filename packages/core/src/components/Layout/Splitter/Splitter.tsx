import { Splitter as AntSplitter } from 'antd';

// Re-export Splitter with all its subcomponents
export const Splitter = Object.assign(AntSplitter, {
  Panel: AntSplitter.Panel,
});

// Export type separately
export type { SplitterProps } from 'antd';
