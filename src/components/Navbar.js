import { useContext, useEffect, useRef, useState } from 'react';
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi';
import { MdLanguage } from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';
import './Navbar.css';

export default function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, setLanguage } = useContext(LanguageContext);
  const location = useLocation();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langMenuRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setShowLangMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setShowLangMenu(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="logo"></Link>

        <div className="nav-center">
          <Link to="/" className={isActive('/') ? 'nav-link active' : 'nav-link'}>
            home
          </Link>
          <Link to="/works" className={isActive('/works') ? 'nav-link active' : 'nav-link'}>
            works
          </Link>
          <Link to="/blog" className={isActive('/blog') ? 'nav-link active' : 'nav-link'}>
            blog
          </Link>
        </div>

        <div className="nav-actions">
          <button onClick={toggleTheme} className="nav-button" title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
            {theme === 'dark' ? <HiOutlineSun size={18} /> : <HiOutlineMoon size={18} />}
          </button>
          <div className="lang-dropdown" ref={langMenuRef}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="nav-button"
              title="Change language"
            >
              <MdLanguage size={18} />
            </button>
            {showLangMenu && (
              <div className="lang-menu">
                <button
                  onClick={() => handleLanguageChange('ja')}
                  className={`lang-option ${language === 'ja' ? 'active' : ''}`}
                >
                  日本語
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`lang-option ${language === 'en' ? 'active' : ''}`}
                >
                  English
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
