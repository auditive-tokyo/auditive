import React, { useState, useEffect } from 'react';
import Footer from './components/Footer';
import Header from './components/Header';
import MainContent from './components/MainContent';
import { Menu, MenuOption, VALID_MENU_OPTIONS } from './components/Menu/Menu';
import { AuthProvider } from './auth/AuthContext';
import PrivateRoute from './auth/PrivateRoute';
import Login from './components/Content/Login/Login';

const App: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<MenuOption>(() => {
    const hash = window.location.hash.slice(1);
    return VALID_MENU_OPTIONS.includes(hash as MenuOption) ? (hash as MenuOption) : 'contact';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (VALID_MENU_OPTIONS.includes(hash as MenuOption)) {
        setActiveMenu(hash as MenuOption);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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