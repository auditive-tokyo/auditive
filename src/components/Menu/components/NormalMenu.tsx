import React from 'react';
import { AnimatedLi } from './AnimatedLi';
import { MenuItem, MenuOption } from '../types';

interface NormalMenuProps {
  menuItems: MenuItem[];
  springs: any[];
  activeMenu: MenuOption;
  handleMenuClick: (menu: MenuOption) => void;
  isAuthenticated: boolean;
  logout: () => void;
  onLoginClick: () => void;
}

export const NormalMenu: React.FC<NormalMenuProps> = ({
  menuItems,
  springs,
  activeMenu,
  handleMenuClick,
  isAuthenticated,
  logout,
  onLoginClick
}) => {
  return (
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
      {/* Login/Logout button */}
      <li className="mt-8">
        {isAuthenticated ? (
          <button
            onClick={logout}
            className="px-4 py-2 text-red-400 hover:text-red-300 transition-colors"
          >
            LOGOUT
          </button>
        ) : (
          <button
            onClick={onLoginClick}
            className="px-4 py-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            LOGIN
          </button>
        )}
      </li>
    </ul>
  );
};

export default NormalMenu;