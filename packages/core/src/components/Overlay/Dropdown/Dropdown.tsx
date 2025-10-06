import { Dropdown as AntDropdown } from 'antd';

export const Dropdown = Object.assign(AntDropdown, {
  Button: AntDropdown.Button,
});

export type { DropdownProps } from 'antd';
