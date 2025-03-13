import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { MenuItem } from '../types';

interface ReorderMenuProps {
  orderedPublishedPages: MenuItem[];
  publishedPages: MenuItem[];
  isAuthenticated: boolean;
  onDragEnd: (result: DropResult) => void;
  defaultPageId: string;
  onSetDefaultPage: (pageId: string) => void;
  onAddChildToParent?: (parentId: string, childId: string) => Promise<boolean>;
  onRemoveChildFromParent?: (parentId: string, childId: string) => Promise<boolean>;
}

export const ReorderMenu: React.FC<ReorderMenuProps> = ({
  orderedPublishedPages,
  publishedPages,
  isAuthenticated,
  onDragEnd,
  defaultPageId,
  onSetDefaultPage,
  onAddChildToParent,
  onRemoveChildFromParent
}) => {
  // 選択中の項目を追跡するための状態
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  // 親メニュー一覧を取得
  const parentMenus = orderedPublishedPages.filter(page => page.isParent);
  
  // 子ページ削除処理
  const handleRemoveChildPage = async (parentId: string, childId: string) => {
    if (!onRemoveChildFromParent) return;
    
    try {
      await onRemoveChildFromParent(parentId, childId);
    } catch (error) {
      console.error('Error removing child page:', error);
      alert('子ページの削除中にエラーが発生しました');
    }
  };

  // 子ページに追加ボタン処理
  const handleAddToParent = async (parentId: string, childId: string) => {
    if (!onAddChildToParent) return;
    try {
      await onAddChildToParent(parentId, childId);
    } catch (error) {
      console.error('Error adding child page:', error);
    }
  };
  
  return (
    <div className="h-full pt-[80px] pb-20 overflow-y-auto">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="menu-items">
          {(provided, snapshot) => (
            <ul 
              className={`flex flex-col items-start pl-12 gap-4 
                        ${snapshot.isDraggingOver ? 'bg-gray-800/30' : ''}`}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
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
                        className={`
                          relative px-4 py-2 
                          text-menu
                          ${snapshot.isDragging ? 'cursor-grabbing shadow-lg' : 'cursor-grab hover:bg-gray-700/30'}
                          bg-gray-800/50 rounded
                          border-l-4 
                          ${item.isParent 
                            ? 'border-purple-500' 
                            : item.name === defaultPageId 
                              ? 'border-amber-500' 
                              : 'border-cyan-500'
                          }
                          text-white w-[90%] flex flex-col
                        `}
                        data-id={item.name}
                        onClick={() => setSelectedItemId(item.name === selectedItemId ? null : item.name)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center w-full">
                            {/* ドラッグハンドルを分けて明示 */}
                            <span 
                              className="mr-2 px-1 py-1 bg-gray-700 rounded cursor-grab" 
                              {...provided.dragHandleProps}
                            >≡</span>
                            {/* 親メニュー表示の特別スタイル */}
                            {item.isParent ? (
                              <span className="font-bold text-purple-300">{item.label} (親)</span>
                            ) : (
                              <span>{item.label}</span>
                            )}
                          </div>
                          
                          {/* 親メニューでなければデフォルト設定ボタンを表示 */}
                          {!item.isParent && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSetDefaultPage(item.name);
                              }}
                              className={`ml-2 px-2 py-1 text-xs rounded ${
                                item.name === defaultPageId 
                                  ? 'bg-amber-600 text-white' 
                                  : 'bg-gray-600 hover:bg-amber-600 text-gray-300 hover:text-white'
                              }`}
                            >
                              {item.name === defaultPageId ? 'Default' : 'Set as Default'}
                            </button>
                          )}
                        </div>
                        
                        {/* 親メニューの場合、子ページリストを表示 */}
                        {item.isParent && (
                          <div className="mt-2 border-l-2 border-purple-500/50 pl-2">
                            <p className="text-xs text-gray-400 mb-2 font-bold">子ページ:</p>
                            
                            {/* 子ページがある場合はリスト表示 */}
                            {item.children && item.children.length > 0 ? (
                              <div className="space-y-1 mb-2">
                                {item.children.map(childId => {
                                  // publishedPagesから子ページを検索（全ての公開ページから検索）
                                  const childPage = publishedPages.find(p => p.name === childId);
                                  return childPage ? (
                                    <div
                                      key={childId}
                                      className="flex items-center justify-between py-1 px-2 
                                               bg-gray-700/50 hover:bg-gray-700 
                                               rounded text-sm border-l-2 border-cyan-500/50"
                                    >
                                      <span>{childPage.label}</span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveChildPage(item.name, childId);
                                        }}
                                        className="text-xs text-red-400 hover:text-red-300 hover:bg-gray-600 p-1 rounded ml-2"
                                      >
                                        削除
                                      </button>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 italic mb-2">子ページはまだありません</p>
                            )}
                            
                            {/* 選択中のページを子ページに追加するボタン表示 */}
                            {selectedItemId && selectedItemId !== item.name && !item.children?.includes(selectedItemId) && (
                              <div className="mt-1 p-2 bg-purple-900/30 border border-purple-500/50 rounded">
                                <p className="text-xs text-gray-300 mb-1">
                                  選択中: {orderedPublishedPages.find(p => p.name === selectedItemId)?.label}
                                </p>
                                <button
                                  onClick={() => {
                                    handleAddToParent(item.name, selectedItemId);
                                    setSelectedItemId(null);
                                  }}
                                  className="text-xs bg-purple-700 hover:bg-purple-600 text-white px-2 py-1 rounded w-full"
                                >
                                  このページを子ページとして追加
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* 通常のページの場合で、選択中かつ親メニューがある場合 */}
                        {!item.isParent && selectedItemId === item.name && parentMenus.length > 0 && (
                          <div className="mt-2 border-l-2 border-cyan-500/50 pl-2">
                            <p className="text-xs text-gray-400 mb-1">このページを追加できる親メニュー:</p>
                            <div className="space-y-1 mb-2">
                              {parentMenus.filter(parent => !parent.children?.includes(item.name))
                                .map(parent => (
                                  <button
                                    key={parent.name}
                                    onClick={() => {
                                      handleAddToParent(parent.name, item.name);
                                      setSelectedItemId(null);
                                    }}
                                    className="flex items-center justify-between py-1 px-2 w-full
                                             bg-gray-700/50 hover:bg-purple-700/50 
                                             rounded text-sm border-l-2 border-purple-500/50
                                             text-left"
                                  >
                                    <span>{parent.label}の子ページに追加</span>
                                    <span className="text-xs">→</span>
                                  </button>
                                ))}
                            </div>
                          </div>
                        )}
                      </li>
                    )}
                  </Draggable>
                ))
              ) : (
                <li className="text-gray-400">公開ページがありません</li>
              )}
              {provided.placeholder}
              
              {/* Static items and reset buttons */}
              <li className="opacity-50 px-4 py-2 text-gray-400 mt-6">
                Static pages:
              </li>
              <li className={`opacity-75 px-4 py-2 text-gray-300 flex items-center justify-between border-l-4 ${defaultPageId === 'contact' ? 'border-amber-500' : 'border-gray-600'}`}>
                <div className="flex items-center">
                  <span>CONTACT</span>
                  {defaultPageId === 'contact' && (
                    <span className="ml-2 text-amber-500 text-xs font-bold">(DEFAULT)</span>
                  )}
                </div>
                <button
                  onClick={() => onSetDefaultPage('contact')}
                  className={`ml-2 px-2 py-1 text-xs rounded ${
                    defaultPageId === 'contact' 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-gray-600 hover:bg-amber-600 text-gray-300 hover:text-white'
                  }`}
                >
                  {defaultPageId === 'contact' ? 'Default' : 'Set as Default'}
                </button>
              </li>
              {isAuthenticated && (
                <li className="opacity-50 px-4 py-2 text-gray-400">
                  - CREATE PAGE (cannot be set as default)
                </li>
              )}
              
              <li className="mt-8 flex gap-2">
                {selectedItemId && (
                  <button
                    onClick={() => setSelectedItemId(null)}
                    className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-500 rounded transition-colors"
                  >
                    選択解除
                  </button>
                )}
              </li>
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ReorderMenu;