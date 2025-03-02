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
  // Get default page from localStorage
  const getDefaultPage = (): string => {
    const savedDefault = localStorage.getItem('defaultPage');
    return savedDefault || 'contact'; // Fallback to 'contact' if no default is set
  };

  // Initialize activeMenu with hash or default page
  const [activeMenu, setActiveMenu] = useState<MenuOption>(() => {
    const hash = window.location.hash.slice(1);
    return hash || getDefaultPage();
  });

  // Update hash change handler to use default page
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      setActiveMenu(hash || getDefaultPage());
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