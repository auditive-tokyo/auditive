import { useState, useEffect, useMemo } from 'react';
import { useContent } from '../../../hooks/useContent';
import { MenuItem, MenuOption } from '../types';

export const useMenuItems = (isAuthenticated: boolean) => {
  const [dynamicPages, setDynamicPages] = useState<MenuItem[]>([]);
  const { getAllContents } = useContent();

  // Store custom order in state
  const [customOrder, setCustomOrder] = useState<string[]>(() => {
    const savedOrder = localStorage.getItem('menuOrder');
    return savedOrder ? JSON.parse(savedOrder) : [];
  });
  
  // Add default page state
  const [defaultPageId, setDefaultPageId] = useState<string>(() => {
    const savedDefault = localStorage.getItem('defaultPage');
    return savedDefault || 'contact';
  });

  // Fetch dynamic pages
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const contents = await getAllContents();
        
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
  }, [getAllContents, isAuthenticated]);

  // Memoize filtered arrays
  const publishedPages = useMemo(() => 
    dynamicPages.filter(page => !page.isDraft), 
    [dynamicPages]
  );
  
  const draftPages = useMemo(() => 
    dynamicPages.filter(page => page.isDraft), 
    [dynamicPages]
  );

  // Apply custom order to published pages
  const orderedPublishedPages = useMemo(() => {
    return [...publishedPages].sort((a, b) => {
      const aIndex = customOrder.indexOf(a.name);
      const bIndex = customOrder.indexOf(b.name);
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      return 0;
    });
  }, [publishedPages, customOrder]);

  // Construct the complete menu items array
  const menuItems = useMemo(() => [
    ...orderedPublishedPages,
    { name: 'contact', label: 'CONTACT' },
    ...(isAuthenticated ? [
      { name: 'create', label: 'CREATE PAGE' },
      ...(draftPages.length > 0 ? [{ name: 'drafts-separator', label: '-- DRAFTS --', isDraft: true, isSeparator: true }] : []),
      ...draftPages
    ] : [])    
  ], [orderedPublishedPages, draftPages, isAuthenticated]);

  // Function to update custom order
  const updateCustomOrder = (newOrder: string[]) => {
    setCustomOrder(newOrder);
    localStorage.setItem('menuOrder', JSON.stringify(newOrder));
  };

  const resetCustomOrder = () => {
    setCustomOrder([]);
    localStorage.removeItem('menuOrder');
  };
  
  // Add function to set default page
  const setDefaultPage = (pageId: string) => {
    setDefaultPageId(pageId);
    localStorage.setItem('defaultPage', pageId);
  };

  return {
    menuItems,
    orderedPublishedPages,
    draftPages,
    customOrder,
    defaultPageId, // Expose the default page ID
    updateCustomOrder,
    resetCustomOrder,
    setDefaultPage  // Expose the function to set default page
  };
};