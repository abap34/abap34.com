import { useContext, useEffect, useRef, useState } from 'react';
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi';
import { MdLanguage } from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';
import InkAnnotation from './InkAnnotation';
import './Navbar.css';

export default function Navbar({ onIncrementAbapNumber }) {
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
          <button
            type="button"
            className="nav-link nav-plus"
            onClick={onIncrementAbapNumber}
            aria-label="increment abap number"
          >
            +
          </button>
          <Link to="/" className={isActive('/') ? 'nav-link active' : 'nav-link'}>
            <InkAnnotation type="circle" show={isActive('/')} padding={3}>home</InkAnnotation>
          </Link>
          <Link to="/works" className={isActive('/works') ? 'nav-link active' : 'nav-link'}>
            <InkAnnotation type="circle" show={isActive('/works')} padding={3}>works</InkAnnotation>
          </Link>
          <Link to="/blog" className={isActive('/blog') ? 'nav-link active' : 'nav-link'}>
            <InkAnnotation type="circle" show={isActive('/blog')} padding={3}>blog</InkAnnotation>
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
                  <InkAnnotation type="circle" show={language === 'ja'} padding={3}>日本語</InkAnnotation>
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`lang-option ${language === 'en' ? 'active' : ''}`}
                >
                  <InkAnnotation type="circle" show={language === 'en'} padding={3}>English</InkAnnotation>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
