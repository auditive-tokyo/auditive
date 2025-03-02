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
  // Simplified activeMenu initialization
  const [activeMenu, setActiveMenu] = useState<MenuOption>(() => {
    const hash = window.location.hash.slice(1);
    // Use 'contact' as the fallback instead of defaultPage
    return hash || 'contact';
  });

  // Simplified hash change handler without defaultPage dependency
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      // Use 'contact' as the fallback instead of defaultPage
      setActiveMenu(hash || 'contact');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []); // No dependency on defaultPage anymore

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