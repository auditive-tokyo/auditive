import React, { useSyncExternalStore } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import MainContent from "./components/MainContent";
import { Menu, MenuOption } from "./components/Menu/Menu";
import { AuthProvider } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";
import Login from "./components/Content/Login/Login";
import CyberCursor from "./components/CyberCursor/CyberCursor";
import { useSiteSettings } from "./hooks/useSiteSettings";

// ハッシュを購読するカスタムフック
const useHash = () => {
  const subscribe = (callback: () => void) => {
    window.addEventListener("hashchange", callback);
    return () => window.removeEventListener("hashchange", callback);
  };
  const getSnapshot = () => window.location.hash.slice(1);
  return useSyncExternalStore(subscribe, getSnapshot);
};

const App: React.FC = () => {
  // DBからデフォルトページIDを取得
  const { defaultPageId, isLoading } = useSiteSettings();
  const hash = useHash();

  // activeMenuはhashがあればhash、なければdefaultPageIdを使用
  const activeMenu: MenuOption = hash || defaultPageId || "";

  const handleMenuClick = (menu: MenuOption) => {
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
        {activeMenu === "login" ? (
          <Login />
        ) : activeMenu === "create" ? (
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
