import React from 'react';
import Contact from './Contact/Contact';
import NewTunesContent from './NewTunesContent/NewTunesContent';
import PastReleasesContent from './PastReleasesContent/PastReleasesContent';
import CreateContent from './CreateContent/CreateContent';
import './styles/contentStyles.css';

export type MenuOption = 'new-tunes' | 'past-releases' | 'contact' | 'create';

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
      case 'create':
        return <CreateContent />;
      default:
        return null;
    }
  };

  return (
    <div className="content-container">
      <div className="content-wrapper">
        {renderContent()}
      </div>
    </div>
  );
};

export default Content;