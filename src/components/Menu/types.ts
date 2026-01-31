import { SpringValue } from "@react-spring/web";

// MenuOptionの型を更新して動的なIDを許可
// 静的メニュー("contact", "create", "login")と動的ページIDの両方を受け入れる
export type MenuOption = string;

// 静的なメニューオプションの定義
export const VALID_MENU_OPTIONS: MenuOption[] = ["contact", "create", "login"];

export interface MenuItem {
  name: MenuOption;
  label: string;
  isDynamic?: boolean;
  isDraft?: boolean;
  isSeparator?: boolean;
  isParent?: boolean; // 親メニューかどうかを示すフラグ
  children?: string[]; // 子メニューのIDリスト
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
}
