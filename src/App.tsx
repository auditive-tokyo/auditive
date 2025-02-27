import React, { useState, useEffect } from 'react';
import Footer from './components/Footer';
import Header from './components/Header';
import MainContent from './components/MainContent';
import { Menu, MenuOption } from './components/Menu/Menu';
import { AuthProvider } from './auth/AuthContext';
import PrivateRoute from './auth/PrivateRoute';
import Login from './components/Content/Login/Login';
import { useContent } from './hooks/useContent';

const App: React.FC = () => {
  const { getAllContents } = useContent();
  const [defaultPage, setDefaultPage] = useState<string>('');

  // メニューアイテムのフェッチとデフォルトページの設定
  useEffect(() => {
    let isMounted = true;

    // Simplified fetchMenuItems function
    const fetchMenuItems = async () => {
      try {
        const contents = await getAllContents();
        if (!isMounted) return;
        
        // Just get the first published page for the default page
        const publishedContents = contents.filter(content => content.status === 'PUBLISHED');
        
        // Set the default page if there's at least one published page
        if (publishedContents.length > 0) {
          const defaultPageId = publishedContents[0].id;
          setDefaultPage(defaultPageId);
          
          // Set hash if empty
          if (!window.location.hash) {
            window.location.hash = defaultPageId;
          }
        } else {
          // Default to contact if no published pages
          setDefaultPage('contact');
          if (!window.location.hash) {
            window.location.hash = 'contact';
          }
        }
      } catch (error) {
        console.error('Error fetching default page:', error);
      }
    };

    fetchMenuItems();
    return () => { isMounted = false; };
  }, [getAllContents]);

  // activeMenuの設定をデバッグ
  useEffect(() => {
    console.log('defaultPage changed:', defaultPage); // デバッグログ追加
  }, [defaultPage]);

  // activeMenuの初期値設定を修正
  const [activeMenu, setActiveMenu] = useState<MenuOption>(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) {
      return defaultPage;  // パス名の参照を削除し、defaultPageを直接使用
    }
    return hash;
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      setActiveMenu(hash || defaultPage);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [defaultPage]);  // 依存配列に defaultPage を追加

  const handleMenuClick = (menu: MenuOption) => {
    setActiveMenu(menu);
    window.location.hash = menu;
  };

  return (
    <AuthProvider>
      <div className="app-layout">
        <Header />
        <Menu activeMenu={activeMenu} onMenuClick={handleMenuClick} />
        {activeMenu === 'login' ? (
          <Login />
        ) : activeMenu === 'create' ? (
          <PrivateRoute>
            <MainContent activeMenu={activeMenu} />
          </PrivateRoute>
        ) : (
          <MainContent activeMenu={activeMenu} />
        )}
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;