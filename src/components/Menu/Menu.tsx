import React, { useEffect, useState } from 'react';
import { animated, useSprings } from 'react-spring';
import './Menu.css';

export type MenuOption = 'new-tunes' | 'past-releases' | 'contact';

interface MenuItem {
  name: MenuOption;
  label: string;
}

interface MenuProps {
  activeMenu: MenuOption;
  onMenuClick: (menu: MenuOption) => void;
}

// 型キャスト: Reactの<li>のプロパティを含むコンポーネントとして扱う
const AnimatedLi = animated.li as unknown as React.FC<
  React.LiHTMLAttributes<HTMLLIElement> & { style?: any }
>;

const Menu: React.FC<MenuProps> = ({ activeMenu, onMenuClick }) => {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems: MenuItem[] = [
    { name: 'new-tunes', label: 'New Tunes' },
    { name: 'past-releases', label: 'Past Releases' },
    { name: 'contact', label: 'Contact' },
  ];

  const getMenuItemSize = (menuItem: MenuOption) => {
    if (menuItem === activeMenu)
      return { fontSize: isMobile ? '18px' : '24px', color: 'rgb(255, 0, 225)' };
    if (
      (activeMenu === 'new-tunes' && menuItem === 'past-releases') ||
      (activeMenu === 'past-releases' &&
        (menuItem === 'new-tunes' || menuItem === 'contact')) ||
      (activeMenu === 'contact' && menuItem === 'past-releases')
    )
      return { fontSize: isMobile ? '16px' : '18px', color: 'rgb(0, 255, 0)' };
    return { fontSize: isMobile ? '14px' : '14px', color: '#0055ff' };
  };

  const springs = useSprings(
    menuItems.length,
    menuItems.map((item) => {
      const { fontSize, color } = getMenuItemSize(item.name);
      return {
        transform:
          isMobile || activeMenu !== item.name ? 'scale(1)' : 'scale(1.1)',
        fontSize,
        color,
        config: { tension: 300, friction: 10 },
      };
    })
  );

  return (
    <nav className={`menu-container ${isMobile ? 'mobile' : ''}`}>
      <ul>
        {menuItems.map((item, index) => {
          const isActive = activeMenu === item.name;
          return (
            <AnimatedLi
              key={item.name}
              className={`menu-item ${isActive ? 'active' : ''}`}
              onClick={() => onMenuClick(item.name)}
              style={springs[index] as any}
            >
              {item.label}
            </AnimatedLi>
          );
        })}
      </ul>
    </nav>
  );
};

export default Menu;