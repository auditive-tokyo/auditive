import React from 'react';
import BackgroundVideo from './BackgroundVideo/BackgroundVideo';
import Content from './Content/Content';

interface MainContentProps {
  activeMenu: string;
}

const MainContent: React.FC<MainContentProps> = ({ activeMenu }) => {
  return (
    <main className="relative min-h-screen">
      <BackgroundVideo />
      <div className="relative w-full min-h-screen pt-[60px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <Content activeMenu={activeMenu} />
      </div>
    </main>
  );
};

export default MainContent;