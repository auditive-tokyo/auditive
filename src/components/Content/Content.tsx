import React from 'react';
import Contact from './Contact/Contact';
import NewTunesContent from './NewTunesContent/NewTunesContent';
import PastReleasesContent from './PastReleasesContent/PastReleasesContent';
import CreateContent from './CreateContent/CreateContent';
import ShowContent from './ShowContent/ShowContent';
import { MenuOption, VALID_MENU_OPTIONS } from '../Menu/Menu';
import './styles/contentStyles.css';

interface ContentProps {
  activeMenu: MenuOption;
}

const Content: React.FC<ContentProps> = ({ activeMenu }) => {
  const renderContent = () => {
    const staticMenus = VALID_MENU_OPTIONS.filter(menu => menu !== 'login');
    
    if (!staticMenus.includes(activeMenu)) {
      return <ShowContent id={activeMenu} />;
    }

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