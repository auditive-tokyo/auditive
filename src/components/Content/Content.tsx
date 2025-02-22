import React from 'react';
import Contact from './Contact/Contact';
import './Content.css';
import NewTunesContent from './NewTunesContent/NewTunesContent';
import PastReleasesContent from './PastReleasesContent/PastReleasesContent';

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
    <div className="content-area">
      {renderContent()}
    </div>
  );
};

export default Content;