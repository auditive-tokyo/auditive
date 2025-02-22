import React, { useState, useEffect } from 'react';
import './App.css';
import Footer from './components/Footer';
import Header from './components/Header';
import MainContent from './components/MainContent';
import Menu from './components/Menu/Menu';

type MenuOption = 'new-tunes' | 'past-releases' | 'contact';

const App: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<MenuOption>(() => {
    const hash = window.location.hash.slice(1);
    const validOptions: MenuOption[] = ['new-tunes', 'past-releases', 'contact'];
    return validOptions.includes(hash as MenuOption) ? (hash as MenuOption) : 'new-tunes';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const validOptions: MenuOption[] = ['new-tunes', 'past-releases', 'contact'];
      if (validOptions.includes(hash as MenuOption)) {
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
    <div className="App">
      <Header />
      <Menu activeMenu={activeMenu} onMenuClick={handleMenuClick} />
      <MainContent activeMenu={activeMenu} />
      <Footer />
    </div>
  );
};

export default App;