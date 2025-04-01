import React, { useState, useEffect } from 'react';
import Footer from './components/Footer';
import Header from './components/Header';
import MainContent from './components/MainContent';
import { Menu, MenuOption } from './components/Menu/Menu';
import { AuthProvider } from './auth/AuthContext';
import PrivateRoute from './auth/PrivateRoute';
import Login from './components/Content/Login/Login';
import CyberCursor from './components/CyberCursor/CyberCursor';
import { useSiteSettings } from './hooks/useSiteSettings';

const App: React.FC = () => {
  // DBからデフォルトページIDを取得
  const { defaultPageId, isLoading } = useSiteSettings();
  const [activeMenu, setActiveMenu] = useState<MenuOption>('');
  
  // 初期化 - ハッシュまたはデフォルトページを使用
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setActiveMenu(hash);
    } else if (!isLoading && defaultPageId) {
      setActiveMenu(defaultPageId);
    }
  }, [isLoading, defaultPageId]);

  // ハッシュ変更の処理 - DBから取得したデフォルトページを使用
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      setActiveMenu(hash || defaultPageId || 'contact');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [defaultPageId]);

  const handleMenuClick = (menu: MenuOption) => {
    setActiveMenu(menu);
    window.location.hash = menu;
  };

  // ロード中は何も表示しない、またはローディングインジケーターを表示
  if (isLoading && !activeMenu) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/70">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <div className="app-layout">
        <CyberCursor />
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