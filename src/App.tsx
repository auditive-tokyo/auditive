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

  // メニューアイテムのフェッチとデフォルトページの設定
  useEffect(() => {
    let isMounted = true;

    const fetchMenuItems = async () => {
      try {
        const contents = await getAllContents();
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
        
        // デフォルトページを設定し、ハッシュが空の場合はURLを更新
        if (allMenuItems.length > 0) {
          const defaultPageId = allMenuItems[0].name;
          setDefaultPage(defaultPageId);
          
          // ハッシュが空の場合、デフォルトページのハッシュを設定
          if (!window.location.hash) {
            window.location.hash = defaultPageId;
          }
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
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