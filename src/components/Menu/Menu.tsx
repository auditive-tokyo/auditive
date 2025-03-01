import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { animated, useSprings } from 'react-spring';
import { useAuth } from '../../auth/AuthContext';
import { useContent } from '../../hooks/useContent';
import { SpringValue } from 'react-spring';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

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
  const [isReorderMode, setIsReorderMode] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { getAllContents } = useContent();

  // Store custom order in state
  const [customOrder, setCustomOrder] = useState<string[]>(() => {
    // Load order from localStorage if available
    const savedOrder = localStorage.getItem('menuOrder');
    return savedOrder ? JSON.parse(savedOrder) : [];
  });

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

  // CRITICAL FIX: Memoize these filtered arrays
  const publishedPages = useMemo(() => 
    dynamicPages.filter(page => !page.isDraft), 
    [dynamicPages]
  );
  
  const draftPages = useMemo(() => 
    dynamicPages.filter(page => page.isDraft), 
    [dynamicPages]
  );

  // This will now only recalculate when publishedPages or customOrder actually change
  const orderedPublishedPages = useMemo(() => {
    return [...publishedPages].sort((a, b) => {
      const aIndex = customOrder.indexOf(a.name);
      const bIndex = customOrder.indexOf(b.name);
      
      // If both items are in the custom order, sort by their positions
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      // If only one item is in the custom order, prioritize it
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // Otherwise, keep original order
      return 0;
    });
  }, [publishedPages, customOrder]); // Only recalculate when these dependencies change

  // メニュー項目の再構成 - MEMOIZE THIS TOO!
  const menuItems = useMemo(() => [
    ...orderedPublishedPages,  // Apply ordered published pages
    { name: 'contact', label: 'CONTACT' },
    ...(isAuthenticated ? [
      { name: 'create', label: 'CREATE PAGE' },
      ...(draftPages.length > 0 ? [{ name: 'drafts-separator', label: '-- DRAFTS --', isDraft: true, isSeparator: true }] : []),
      ...draftPages  // ドラフトページ（ログイン時のみ、CREATE PAGEの後に表示）
    ] : [])    
  ], [orderedPublishedPages, draftPages, isAuthenticated]);

  // Add debug logging
  // useEffect(() => {
  //   console.log("Published pages available:", orderedPublishedPages);
  // }, [orderedPublishedPages]);

  // Simplified handleDragEnd for more stable behavior
  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    
    console.log("Drag end:", result);
    
    // Bail out if no destination or dragged to same spot
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Get current ordered items
    const items = [...orderedPublishedPages];
    
    // Move the item
    const [removed] = items.splice(source.index, 1);
    items.splice(destination.index, 0, removed);
    
    // Create new order based on item names
    const newOrder = items.map(item => item.name);
    
    // Update state and localStorage
    setCustomOrder(newOrder);
    localStorage.setItem('menuOrder', JSON.stringify(newOrder));
  };

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
    if (!isReorderMode) {
      onMenuClick(menu);
      setIsOpen(false);
    }
  };

  const toggleReorderMode = () => {
    setIsReorderMode(!isReorderMode);
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

        {/* Reorder mode toggle button (only for authenticated users) */}
        {isAuthenticated && (
          <button
            onClick={toggleReorderMode}
            className={`absolute top-6 left-6 px-4 py-2 rounded ${
              isReorderMode ? 'bg-amber-500 text-black' : 'bg-gray-700 text-white'
            }`}
          >
            {isReorderMode ? 'Exit Reorder Mode' : 'Reorder Menu'}
          </button>
        )}

        {/* Instructions for reorder mode */}
        {isReorderMode && (
          <div className="absolute top-20 left-6 right-6 bg-gray-800/80 p-3 rounded text-sm text-gray-300">
            Drag and drop the published pages to reorder them in the menu.
            <br />
            Changes are saved automatically.
          </div>
        )}

        {isReorderMode ? (
          // UPDATED drag and drop interface
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="menu-items">
              {(provided) => (
                <ul 
                  className="h-full flex flex-col items-start pl-12 gap-4 pt-[180px]"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {/* Ensure pages exist before rendering */}
                  {orderedPublishedPages.length > 0 ? (
                    orderedPublishedPages.map((item, index) => (
                      <Draggable 
                        key={item.name} 
                        draggableId={item.name} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`
                              relative px-4 py-2 
                              text-menu
                              ${snapshot.isDragging ? 'cursor-grabbing' : 'cursor-grab'}
                              bg-gray-800/50 rounded
                              border-l-4 border-cyan-500
                              text-white w-[70%]
                            `}
                            data-id={item.name} // Add data attribute for debugging
                          >
                            ≡ {item.label}
                          </li>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <li className="text-gray-400">No published pages to reorder</li>
                  )}
                  {provided.placeholder}
                  
                  {/* Non-draggable static items for reference */}
                  <li className="opacity-50 px-4 py-2 text-gray-400">
                    Static pages (cannot be reordered):
                  </li>
                  <li className="opacity-50 px-4 py-2 text-gray-400">
                    - CONTACT
                  </li>
                  {isAuthenticated && (
                    <li className="opacity-50 px-4 py-2 text-gray-400">
                      - CREATE PAGE
                    </li>
                  )}
                  
                  {/* Reset order button */}
                  <li className="mt-8">
                    <button
                      onClick={() => {
                        setCustomOrder([]);
                        localStorage.removeItem('menuOrder');
                      }}
                      className="px-4 py-2 bg-red-500/50 text-white hover:bg-red-500 rounded transition-colors"
                    >
                      Reset to Default Order
                    </button>
                  </li>
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          // Normal menu display
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
                      onMenuClick('contact');
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
        )}
      </div>
    </nav>
  );
};

export default Menu;