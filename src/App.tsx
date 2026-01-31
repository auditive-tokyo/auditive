import React, { useState, useEffect } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import MainContent from "./components/MainContent";
import { Menu } from "./components/Menu/Menu";
import { AuthProvider } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";
import Login from "./components/Content/Login/Login";
import CyberCursor from "./components/CyberCursor/CyberCursor";
import { useSiteSettings } from "./hooks/useSiteSettings";

const SECRET_LOGIN_HASH = "#fxxking-login";

const App: React.FC = () => {
  // DBからデフォルトページIDを取得
  const { defaultPageId, isLoading } = useSiteSettings();
  // selectedMenu: ユーザーが選択したメニュー（null = まだ選択していない）
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  // シークレットログインハッシュを検知
  const [showSecretLogin, setShowSecretLogin] = useState(false);

  // ハッシュ変更を監視
  useEffect(() => {
    const checkHash = () => {
      if (globalThis.location.hash === SECRET_LOGIN_HASH) {
        setShowSecretLogin(true);
        // ハッシュをクリア（URLに残さない）
        globalThis.history.replaceState(null, "", globalThis.location.pathname);
      }
    };

    // 初期チェック
    checkHash();

    // ハッシュ変更を監視
    globalThis.addEventListener("hashchange", checkHash);
    return () => globalThis.removeEventListener("hashchange", checkHash);
  }, []);

  // 表示するメニュー: 選択済みならそれ、なければデフォルトページ
  const activeMenu: string = selectedMenu ?? defaultPageId ?? "";

  const handleMenuClick = (menu: string) => {
    setSelectedMenu(menu);
    // メニューをクリックしたらシークレットログインを閉じる
    setShowSecretLogin(false);
  };

  // ロード中は何も表示しない、またはローディングインジケーターを表示
  if (isLoading && !activeMenu) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/70">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // メインコンテンツをレンダリング
  const renderContent = () => {
    if (showSecretLogin) {
      return <Login onLoginSuccess={() => setShowSecretLogin(false)} />;
    }
    if (activeMenu === "create") {
      return (
        <PrivateRoute>
          <MainContent activeMenu={activeMenu} />
        </PrivateRoute>
      );
    }
    return <MainContent activeMenu={activeMenu} />;
  };

  return (
    <AuthProvider>
      <div className="app-layout">
        <CyberCursor />
        <Header />
        <Menu activeMenu={activeMenu} onMenuClick={handleMenuClick} />
        {renderContent()}
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;
