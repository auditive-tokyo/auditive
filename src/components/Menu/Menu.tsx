import React, { useEffect, useState } from 'react';
import { animated, useSprings } from 'react-spring';
import { useAuth } from '../../Auth/AuthContext';
import { useContent } from '../../hooks/useContent';  // 追加

// MenuOptionの型を更新して動的なIDを許可
export type MenuOption = 'new-tunes' | 'past-releases' | 'contact' | 'create' | 'login' | string;

// 静的なメニューオプションの定義
export const VALID_MENU_OPTIONS: MenuOption[] = ['new-tunes', 'past-releases', 'contact', 'create', 'login'];

interface MenuItem {
  name: MenuOption;
  label: string;
  isDynamic?: boolean;  // 動的ページかどうかを識別
}

interface MenuProps {
  activeMenu: MenuOption;
  onMenuClick: (menu: MenuOption) => void;
}

const AnimatedLi = animated.li as unknown as React.FC<
  React.LiHTMLAttributes<HTMLLIElement> & { style?: any }
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
        const publishedPages = contents
          .filter(content => content.status === 'PUBLISHED')
          .map(content => ({
            name: content.id,
            label: content.title,
            isDynamic: true
          }));
        setDynamicPages(publishedPages);
      } catch (error) {
        console.error('Error fetching pages:', error);
      }
    };

    fetchPages();
  }, [getAllContents]);

  // 静的メニュー項目と動的ページを結合
  const menuItems: MenuItem[] = [
    { name: 'new-tunes', label: 'NEW TUNES' },
    { name: 'past-releases', label: 'PAST RELEASES' },
    { name: 'contact', label: 'CONTACT' },
    ...(isAuthenticated ? [{ name: 'create', label: 'CREATE PAGE' }] : []),
    ...dynamicPages
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
        className="p-3 bg-black/30 backdrop-blur-sm rounded-md" // p-2 から p-3 に変更
      >
        <div className={`w-8 h-[3px] bg-white rounded-full transition-all duration-300 ${  // w-6 から w-8 に変更
          isOpen ? 'rotate-45 translate-y-[10px]' : ''  // 8px から 10px に調整
        }`} />
        <div className={`w-8 h-[3px] bg-white rounded-full my-[7px] transition-opacity ${  // w-6 から w-8 に、my-[6px] から my-[7px] に変更
          isOpen ? 'opacity-0' : 'opacity-100'
        }`} />
        <div className={`w-8 h-[3px] bg-white rounded-full transition-all duration-300 ${  // w-6 から w-8 に変更
          isOpen ? '-rotate-45 -translate-y-[10px]' : ''  // -8px から -10px に調整
        }`} />
      </button>

      {/* メニュー本体 */}
      <div className={`fixed top-0 left-0 h-full w-[300px] max-w-[500px] bg-black/50 backdrop-blur-sm transition-transform duration-300 ${
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
              onClick={() => handleMenuClick(item.name)}
              className={`
                relative px-4 py-2 
                text-menu
                cursor-pointer
                ${item.isDynamic ? 'text-gray-300' : ''}  // 動的ページは少し色を変える
                before:absolute before:left-0 before:bottom-0
                before:w-full before:h-[1px]
                before:bg-cyan-400
                before:transform before:scale-x-0
                before:transition-transform before:duration-300
                hover:before:scale-x-100
                ${activeMenu === item.name ? 'before:scale-x-100' : ''}
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
                    onMenuClick('new-tunes');
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