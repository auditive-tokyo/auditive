import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { MenuItem } from '../types';

interface ReorderMenuProps {
  orderedPublishedPages: MenuItem[];
  isAuthenticated: boolean;
  onDragEnd: (result: DropResult) => void;
  onResetOrder: () => void;
}

export const ReorderMenu: React.FC<ReorderMenuProps> = ({
  orderedPublishedPages,
  isAuthenticated,
  onDragEnd,
  onResetOrder
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
                        border-l-4 border-cyan-500
                        text-white w-[70%]
                      `}
                      data-id={item.name}
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
            
            {/* Static items */}
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
            
            {/* Reset button */}
            <li className="mt-8">
              <button
                onClick={onResetOrder}
                className="px-4 py-2 bg-red-500/50 text-white hover:bg-red-500 rounded transition-colors"
              >
                Reset to Default Order
              </button>
            </li>
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
};