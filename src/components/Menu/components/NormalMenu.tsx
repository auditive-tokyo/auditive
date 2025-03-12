import React, { useState } from 'react';
import { AnimatedLi } from './AnimatedLi';
import { MenuItem, MenuOption } from '../types';

interface NormalMenuProps {
  menuItems: MenuItem[];
  springs: any[];
  activeMenu: MenuOption;
  handleMenuClick: (menu: MenuOption, isParent?: boolean) => void; // 第2引数を追加
  isAuthenticated: boolean;
  logout: () => void;
  onLoginClick: () => void;
  onDeleteMenuItem: (pageId: string) => Promise<boolean>;
  onCreateParentMenu?: (name: string) => Promise<boolean>;
  expandedParents: Set<string>;
  publishedPages: MenuItem[];
}

export const NormalMenu: React.FC<NormalMenuProps> = ({
  menuItems,
  springs,
  activeMenu,
  handleMenuClick,
  isAuthenticated,
  logout,
  onLoginClick,
  onDeleteMenuItem,
  onCreateParentMenu,
  expandedParents, // ここに追加
  publishedPages    // ここに追加
}) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showParentMenuInput, setShowParentMenuInput] = useState(false);
  const [parentMenuName, setParentMenuName] = useState('');
  const [isCreatingParent, setIsCreatingParent] = useState(false);
  
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
  
  // 親メニュー作成処理ハンドラ
  const handleCreateParentMenu = async () => {
    if (!parentMenuName.trim() || !onCreateParentMenu) return;
    
    setIsCreatingParent(true);
    try {
      const success = await onCreateParentMenu(parentMenuName);
      if (success) {
        setParentMenuName('');
        setShowParentMenuInput(false);
      } else {
        alert('Failed to create parent menu');
      }
    } catch (error) {
      console.error('Error creating parent menu:', error);
      alert('An error occurred while creating the parent menu');
    } finally {
      setIsCreatingParent(false);
    }
  };
  
  return (
    <ul className="h-full flex flex-col items-start pl-12 gap-4 pt-[120px]">
      {menuItems.map((item, index) => (
        <React.Fragment key={item.name}>
          <AnimatedLi
            onClick={item.isSeparator ? undefined : () => handleMenuClick(item.name, item.isParent)}
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
              <div className="flex items-center">
                {/* 親メニュー項目の場合、展開/折りたたみアイコンを表示 */}
                {item.isParent && (
                  <span className="mr-2 text-gray-400 transform transition-transform">
                    {expandedParents.has(item.name) ? '▼' : '►'}
                  </span>
                )}
                <span>{item.label}</span>
              </div>

              {isAuthenticated && item.isDynamic && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(item.name);
                  }}
                  className="opacity-0 group-hover:opacity-100 w-5 h-5 ml-1 flex items-center justify-center rounded-full bg-red-500 text-white text-xs transition-opacity"
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
          
          {/* 親メニューが展開されている場合、子メニュー項目を表示 */}
          {item.isParent && item.children && expandedParents.has(item.name) && (
            <div className="ml-10 border-l-2 border-purple-500/30 pl-2 space-y-2">
              {item.children.map(childId => {
                const childItem = publishedPages.find(p => p.name === childId);
                if (!childItem) return null;
                
                return (
                  <li
                    key={childId}
                    onClick={() => handleMenuClick(childId)}
                    className={`
                      px-4 py-2 text-menu
                      cursor-pointer
                      text-gray-300 hover:text-white
                      ${activeMenu === childId ? 'text-cyan-400' : ''}
                      transition-colors duration-200
                      group relative
                    `}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <span>{childItem.label}</span>
                      </div>
                      
                      {/* 子ページの削除ボタン */}
                      {isAuthenticated && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(childId);
                          }}
                          className="opacity-0 group-hover:opacity-100 w-5 h-5 ml-1 flex items-center justify-center rounded-full bg-red-500 text-white text-xs transition-opacity"
                          aria-label={`Delete ${childItem.label}`}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    
                    {/* 削除確認ダイアログ (子ページ用) */}
                    {confirmDelete === childId && (
                      <div className="absolute left-full ml-2 top-0 bg-gray-800 p-3 rounded shadow-lg z-10 w-[200px]">
                        <p className="text-sm mb-2">Delete "{childItem.label}"?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => handleDelete(e, childId)}
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
                  </li>
                );
              })}
            </div>
          )}
        </React.Fragment>
      ))}
      
      {/* 親メニュー作成UI */}
      {isAuthenticated && (
        <li className="mt-4">
          {showParentMenuInput ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={parentMenuName}
                onChange={(e) => setParentMenuName(e.target.value)}
                placeholder="親メニュー名"
                className="px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded focus:border-cyan-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateParentMenu}
                  disabled={isCreatingParent || !parentMenuName.trim()}
                  className="px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {isCreatingParent ? '作成中...' : '作成'}
                </button>
                <button
                  onClick={() => {
                    setShowParentMenuInput(false);
                    setParentMenuName('');
                  }}
                  className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowParentMenuInput(true)}
              className="px-4 py-2 text-cyan-500 hover:text-cyan-400 transition-colors"
            >
              親メニューを作成
            </button>
          )}
        </li>
      )}
      
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