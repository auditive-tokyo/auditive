import React from 'react';
import Contact from './Contact/Contact';
import NewTunesContent from './NewTunesContent/NewTunesContent';
import PastReleasesContent from './PastReleasesContent/PastReleasesContent';
import '../../styles/contentStyles.css';

export type MenuOption = 'new-tunes' | 'past-releases' | 'contact';

interface ContentProps {
  activeMenu: MenuOption;
}

const Content: React.FC<ContentProps> = ({ activeMenu }) => {
  const renderContent = () => {
    switch (activeMenu) {
      case 'new-tunes':
        return <NewTunesContent />;
      case 'past-releases':
        return <PastReleasesContent />;
      case 'contact':
        return <Contact />;
      default:
        return null;
    }
  };

  return (
    // main-content
    <div className="relative h-screen overflow-hidden pt-[60px]">
      {/* content-wrapper */}
      <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center">
        {/* scrollable-content */}
        <div className="overflow-y-auto w-full h-full p-5 box-border [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* content area */}
          <div className="grow text-white bg-black/50 flex items-center flex-col">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;