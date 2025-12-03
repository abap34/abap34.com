import { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LanguageContext from '../context/LanguageContext';
import SidebarContext from '../context/SidebarContext';
import './Sidebar.css';

export default function Sidebar() {
    const isDarkOS = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // localStorageからテーマを取得、なければOSの設定を使用
    const getInitialTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme !== null) {
            return savedTheme === 'dark';
        }
        return isDarkOS;
    };

    const [isDark, setIsDark] = useState(getInitialTheme);
    const { language, toggleLanguage } = useContext(LanguageContext);
    const { setIsOpen } = useContext(SidebarContext);
    const location = useLocation();

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-webtui-theme', 'catppuccin-mocha');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.removeAttribute('data-webtui-theme');
        }
        // テーマをlocalStorageに保存
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const linkClass = (path) =>
        `sidebar-link ${location.pathname === path ? 'active' : ''}`;

    const handleLinkClick = () => {
        // モバイルでページ遷移時にサイドバーを閉じる
        if (window.innerWidth <= 768) {
            setIsOpen(false);
        }
    };

    return (
        <nav className="sidebar">
            <column className="sidebar-container">
                <column className="sidebar-navigation">
                    <div className="sidebar-title">abap34.com/</div>
                    <column className="sidebar-links">
                        <Link to="/" className={linkClass('/')} onClick={handleLinkClick}>
                            ├─ About
                        </Link>
                        <Link to="/background" className={linkClass('/background')} onClick={handleLinkClick}>
                            ├─ Background
                        </Link>
                        <Link to="/works" className={linkClass('/works')} onClick={handleLinkClick}>
                            ├─ Works
                        </Link>
                        <Link to="/blog" className={linkClass('/blog')} onClick={handleLinkClick}>
                            └─ Blog
                        </Link>
                    </column>
                </column>

                <hr className="sidebar-separator" />

                <column className="sidebar-settings">
                    <div className="sidebar-settings-title">SETTINGS</div>

                    <column className="sidebar-setting-group">
                        <div className="sidebar-setting-label">Theme</div>
                        <label>
                            <input
                                type="checkbox"
                                is-="switch"
                                checked={isDark}
                                onChange={(e) => setIsDark(e.target.checked)}
                            />
                            {isDark ? 'Dark' : 'Light'}
                        </label>
                    </column>

                    <column className="sidebar-setting-group">
                        <div className="sidebar-setting-label">Language</div>
                        <select
                            is-="select"
                            value={language}
                            onChange={(e) => toggleLanguage(e.target.value)}
                            className="sidebar-select"
                        >
                            <option value="ja">Japanese</option>
                            <option value="en">English (machine translation)</option>
                        </select>
                    </column>
                </column>
            </column>
        </nav>
    );
}