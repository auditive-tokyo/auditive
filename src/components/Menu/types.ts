import { SpringValue } from 'react-spring';

// MenuOptionの型を更新して動的なIDを許可
export type MenuOption = 'contact' | 'create' | 'login' | string;

// 静的なメニューオプションの定義
export const VALID_MENU_OPTIONS: MenuOption[] = ['contact', 'create', 'login'];

export interface MenuItem {
  name: MenuOption;
  label: string;
  isDynamic?: boolean;
  isDraft?: boolean;
  isSeparator?: boolean;
}

export interface MenuProps {
  activeMenu: MenuOption;
  onMenuClick: (menu: MenuOption) => void;
}

// Type for animated styles
export interface AnimatedStyles {
  transform?: SpringValue<string>;
  opacity?: SpringValue<number>;
  y?: SpringValue<number>;
  color?: SpringValue<string>;
  [key: string]: SpringValue<any> | undefined;
}