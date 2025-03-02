import React, { useState } from 'react';
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
  onDeleteMenuItem: (pageId: string) => Promise<boolean>; // Add this prop
}

export const NormalMenu: React.FC<NormalMenuProps> = ({
  menuItems,
  springs,
  activeMenu,
  handleMenuClick,
  isAuthenticated,
  logout,
  onLoginClick,
  onDeleteMenuItem
}) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation(); // Prevent menu click
    
    setIsDeleting(true);
    try {
      const success = await onDeleteMenuItem(pageId);
      if (success) {
        setConfirmDelete(null);
      } else {
        alert('Failed to delete page');
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('An error occurred while deleting the page');
    } finally {
      setIsDeleting(false);
    }
  };
  
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
            group
          `}
          style={springs[index]}
        >
          <div className="flex items-center justify-between w-full">
            <span>{item.label}</span>
            
            {/* Delete button for authenticated users and dynamic pages */}
            {isAuthenticated && item.isDynamic && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(item.name);
                }}
                className="opacity-0 group-hover:opacity-100 ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs transition-opacity"
                aria-label={`Delete ${item.label}`}
              >
                ✕
              </button>
            )}
          </div>
          
          {/* Delete confirmation dialog */}
          {confirmDelete === item.name && (
            <div className="absolute left-full ml-2 top-0 bg-gray-800 p-3 rounded shadow-lg z-10 w-[200px]">
              <p className="text-sm mb-2">Delete "{item.label}"?</p>
              <div className="flex gap-2">
                <button
                  onClick={(e) => handleDelete(e, item.name)}
                  disabled={isDeleting}
                  className="px-2 py-1 bg-red-500 text-white text-xs rounded"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, delete'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(null);
                  }}
                  className="px-2 py-1 bg-gray-600 text-white text-xs rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
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