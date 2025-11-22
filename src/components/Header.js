import { useContext, useState } from 'react';
import SidebarContext from '../context/SidebarContext';
import LanguageContext from '../context/LanguageContext';
import './Header.css';

export default function Header() {
  const { toggleSidebar } = useContext(SidebarContext);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const [isThree, setIsThree] = useState(true);

  const handlePlusClick = () => {
    if (isThree) {
      setIsThree(false);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-controls">
          <button onClick={toggleSidebar} className="header-button">
            {isThree ? '三' : '四'}
          </button>
          <button onClick={handlePlusClick} className="header-button">
            ＋
          </button>
          <button 
            onClick={() => toggleLanguage(language === 'ja' ? 'en' : 'ja')} 
            className="header-button header-language-toggle"
            title={language === 'ja' ? 'Switch to English' : 'Switch to Japanese'}
          >
            {language === 'ja' ? 'EN' : 'JP'}
          </button>
        </div>
      </div>
    </header>
  );
}
