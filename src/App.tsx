import React, { useState, useEffect } from 'react';
import Footer from './components/Footer';
import Header from './components/Header';
import MainContent from './components/MainContent';
import { Menu, MenuOption, VALID_MENU_OPTIONS } from './components/Menu/Menu';
import { AuthProvider } from './auth/AuthContext';
import PrivateRoute from './auth/PrivateRoute';
import Login from './components/Content/Login/Login';
import { useContent } from './hooks/useContent';

const App: React.FC = () => {
  const { getAllContents } = useContent();
  const [defaultPage, setDefaultPage] = useState<string>('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    let isMounted = true;  // コンポーネントのマウント状態を追跡

    const fetchMenuItems = async () => {
      console.log('Fetching menu items...');
      try {
        const contents = await getAllContents();
        
        // コンポーネントがアンマウントされていたら更新しない
        if (!isMounted) return;

        const publishedPages = contents
          .filter(content => content.status === 'PUBLISHED')
          .map(content => ({
            name: content.id,
            label: content.title,
            isDynamic: true
          }));
        
        const allMenuItems = [
          ...publishedPages,
          { name: 'contact', label: 'CONTACT' }
        ];
        
        setMenuItems(allMenuItems);
        
        if (allMenuItems.length > 0) {
          setDefaultPage(allMenuItems[0].name);
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };

    fetchMenuItems();

    // クリーンアップ関数
    return () => {
      isMounted = false;
    };
  }, []); // 依存配列を空に

  // activeMenuの設定をデバッグ
  useEffect(() => {
    console.log('defaultPage changed:', defaultPage); // デバッグログ追加
  }, [defaultPage]);

  const [activeMenu, setActiveMenu] = useState<MenuOption>(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) {
      const pathname = window.location.pathname.slice(1);
      return pathname || defaultPage;
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
        <Header className="header-footer-common" />
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
        <Footer className="header-footer-common" />
      </div>
    </AuthProvider>
  );
};

export default App;