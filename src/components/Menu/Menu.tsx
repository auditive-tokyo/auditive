import React, { useEffect, useState } from 'react';
import { animated, useSprings } from 'react-spring';
import { useAuth } from '../../auth/AuthContext';
import { useContent } from '../../hooks/useContent';  // 追加
import { SpringValue } from 'react-spring';

// MenuOptionの型を更新して動的なIDを許可
export type MenuOption = 'contact' | 'create' | 'login' | string;

// 静的なメニューオプションの定義
export const VALID_MENU_OPTIONS: MenuOption[] = ['contact', 'create', 'login'];

interface MenuItem {
  name: MenuOption;
  label: string;
  isDynamic?: boolean;
  isDraft?: boolean;
  isSeparator?: boolean;
}

interface MenuProps {
  activeMenu: MenuOption;
  onMenuClick: (menu: MenuOption) => void;
}

// Define a type for the animated styles
interface AnimatedStyles {
  transform?: SpringValue<string>;
  opacity?: SpringValue<number>;
  y?: SpringValue<number>;
  color?: SpringValue<string>;
  [key: string]: SpringValue<any> | undefined;
}

// Update the AnimatedLi definition
const AnimatedLi = animated.li as unknown as React.FC<
  Omit<React.LiHTMLAttributes<HTMLLIElement>, 'style'> & { 
    style?: {
      transform?: SpringValue<string>;
      opacity?: SpringValue<number>;
      y?: SpringValue<number>;
      color?: SpringValue<string>;
      [key: string]: SpringValue<any> | undefined;
    }
  }
>;

export const Menu: React.FC<MenuProps> = ({ activeMenu, onMenuClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dynamicPages, setDynamicPages] = useState<MenuItem[]>([]);
  const { isAuthenticated, logout } = useAuth();
  const { getAllContents } = useContent();

  // 動的ページの取得
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const contents = await getAllContents();
        
        // Show PUBLISHED pages to everyone, and DRAFT pages only to authenticated users
        const dynamicMenuPages = contents
          .filter(content => 
            content.status === 'PUBLISHED' || 
            (isAuthenticated && content.status === 'DRAFT')
          )
          .map(content => ({
            name: content.id,
            label: content.status === 'DRAFT' ? `${content.title} (Draft)` : content.title,
            isDynamic: true,
            isDraft: content.status === 'DRAFT'
          }));
          
        setDynamicPages(dynamicMenuPages);
      } catch (error) {
        console.error('Error fetching pages:', error);
      }
    };

    fetchPages();
  }, [getAllContents, isAuthenticated]); // Add isAuthenticated as dependency to refetch when auth state changes

  // 静的メニュー項目と動的ページを結合
  const publishedPages = dynamicPages.filter(page => !page.isDraft);
  const draftPages = dynamicPages.filter(page => page.isDraft);

  // メニュー項目の再構成 - Draft pages appear after CREATE PAGE
  const menuItems: MenuItem[] = [
    ...publishedPages,  // 公開ページ
    { name: 'contact', label: 'CONTACT' },
    ...(isAuthenticated ? [
      { name: 'create', label: 'CREATE PAGE' },
      ...(draftPages.length > 0 ? [{ name: 'drafts-separator', label: '-- DRAFTS --', isDraft: true, isSeparator: true }] : []),
      ...draftPages  // ドラフトページ（ログイン時のみ、CREATE PAGEの後に表示）
    ] : [])    
  ];

  // スプリングアニメーションの設定を更新
  const springs = useSprings(
    menuItems.length,
    menuItems.map((item) => ({
      transform: activeMenu === item.name ? 'scale(1.05)' : 'scale(1)',
      opacity: isOpen ? 1 : 0,
      y: isOpen ? 0 : -20,
      color: activeMenu === item.name ? 'rgb(34, 211, 238)' : 'rgba(255, 255, 255, 0.9)',
      config: { tension: 300, friction: 20 },
    }))
  );

  const handleMenuClick = (menu: MenuOption) => {
    onMenuClick(menu);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-[100px] left-4 z-50">
      {/* ハンバーガーボタン - サイズを大きく */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-black/30 rounded-md"
      >
        <div className={`w-8 h-[3px] bg-white rounded-full transition-all duration-300 ${
          isOpen ? 'rotate-45 translate-y-[10px]' : ''
        }`} />
        <div className={`w-8 h-[3px] bg-white rounded-full my-[7px] transition-opacity ${
          isOpen ? 'opacity-0' : 'opacity-100'
        }`} />
        <div className={`w-8 h-[3px] bg-white rounded-full transition-all duration-300 ${
          isOpen ? '-rotate-45 -translate-y-[10px]' : ''
        }`} />
      </button>

      {/* メニュー本体 */}
      <div className={`fixed top-0 left-0 h-full w-[400px] bg-black/85 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* 閉じるボタン - 線を太く */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 p-2 hover:opacity-70 transition-opacity"
          aria-label="Close menu"
        >
          <div className="w-8 h-[4px] bg-gray-400 rounded-full rotate-45 absolute"></div>
          <div className="w-8 h-[4px] bg-gray-400 rounded-full -rotate-45 absolute"></div>
        </button>

        <ul className="h-full flex flex-col items-start pl-12 gap-4 pt-[120px]">
          {menuItems.map((item, index) => (
            <AnimatedLi
              key={item.name}
              onClick={item.isSeparator ? undefined : () => handleMenuClick(item.name)}
              className={`
                relative px-4 py-2 
                text-menu
                ${!item.isSeparator ? 'cursor-pointer' : 'cursor-default'}
                ${item.isDynamic ? 'text-gray-300' : ''}
                ${item.isDraft && !item.isSeparator ? 'text-amber-400' : ''}
                ${item.isSeparator ? 'text-gray-500 text-sm font-bold' : ''}
                before:absolute before:left-0 before:bottom-0
                before:w-full before:h-[1px]
                before:bg-cyan-400
                before:transform before:scale-x-0
                before:transition-transform before:duration-300
                ${!item.isSeparator ? 'hover:before:scale-x-100' : ''}
                ${activeMenu === item.name && !item.isSeparator ? 'before:scale-x-100' : ''}
              `}
              style={springs[index]}
            >
              {item.label}
            </AnimatedLi>
          ))}
          {/* ログインボタンの追加 */}
          <li className="mt-8">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  if (activeMenu === 'create') {
                    onMenuClick('contact');  // new-tunes から contact に変更
                  }
                }}
                className="px-4 py-2 text-red-400 hover:text-red-300 transition-colors"
              >
                LOGOUT
              </button>
            ) : (
              <button
                onClick={() => onMenuClick('login')}
                className="px-4 py-2 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                LOGIN
              </button>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Menu;