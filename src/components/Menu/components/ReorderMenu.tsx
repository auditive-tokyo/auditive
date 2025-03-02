import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { MenuItem } from '../types';

interface ReorderMenuProps {
  orderedPublishedPages: MenuItem[];
  isAuthenticated: boolean;
  onDragEnd: (result: DropResult) => void;
  onResetOrder: () => void;
  defaultPageId: string;
  onSetDefaultPage: (pageId: string) => void;
}

export const ReorderMenu: React.FC<ReorderMenuProps> = ({
  orderedPublishedPages,
  isAuthenticated,
  onDragEnd,
  onResetOrder,
  defaultPageId,
  onSetDefaultPage
}) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="menu-items">
        {(provided) => (
          <ul 
            className="h-full flex flex-col items-start pl-12 gap-4 pt-[180px]"
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
                      {...provided.dragHandleProps}
                      className={`
                        relative px-4 py-2 
                        text-menu
                        ${snapshot.isDragging ? 'cursor-grabbing' : 'cursor-grab'}
                        bg-gray-800/50 rounded
                        border-l-4 ${item.name === defaultPageId ? 'border-amber-500' : 'border-cyan-500'}
                        text-white w-[70%] flex items-center justify-between
                      `}
                      data-id={item.name}
                    >
                      <div className="flex items-center">
                        <span className="mr-2">≡</span>
                        <span>{item.label}</span>
                        {item.name === defaultPageId && (
                          <span className="ml-2 text-amber-500 text-xs font-bold">(DEFAULT)</span>
                        )}
                      </div>
                      <button
                        onClick={() => onSetDefaultPage(item.name)}
                        className={`ml-2 px-2 py-1 text-xs rounded ${
                          item.name === defaultPageId 
                            ? 'bg-amber-600 text-white' 
                            : 'bg-gray-600 hover:bg-amber-600 text-gray-300 hover:text-white'
                        }`}
                      >
                        {item.name === defaultPageId ? 'Default' : 'Set as Default'}
                      </button>
                    </li>
                  )}
                </Draggable>
              ))
            ) : (
              <li className="text-gray-400">No published pages to reorder</li>
            )}
            {provided.placeholder}
            
            {/* Static items */}
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
            
            {/* Reset buttons */}
            <li className="mt-8 flex gap-2">
              <button
                onClick={onResetOrder}
                className="px-4 py-2 bg-red-500/50 text-white hover:bg-red-500 rounded transition-colors"
              >
                Reset Menu Order
              </button>
            </li>
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ReorderMenu;