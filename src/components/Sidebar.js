import { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LanguageContext from '../context/LanguageContext';
import { Switch } from '../design-system';
import './Sidebar.css';

export default function Sidebar() {
    const isDarkOS = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const [isDark, setIsDark] = useState(isDarkOS);
    const { language, toggleLanguage } = useContext(LanguageContext);
    const location = useLocation();

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-webtui-theme', 'catppuccin-mocha');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.removeAttribute('data-webtui-theme');
        }
    }, [isDark]);

    const linkClass = (path) =>
        `sidebar-link ${location.pathname === path ? 'active' : ''}`;

    return (
        <nav className="sidebar">
            <div className="sidebar-navigation">
                <div className="sidebar-title">abap34.com/</div>
                <div className="sidebar-links">
                    <Link to="/" className={linkClass('/')}>
                        ├─ About
                    </Link>
                    <Link to="/background" className={linkClass('/background')}>
                        ├─ Background
                    </Link>
                    <Link to="/works" className={linkClass('/works')}>
                        ├─ Works
                    </Link>
                    <Link to="/blog" className={linkClass('/blog')}>
                        └─ Blog
                    </Link>
                </div>
            </div>

            <hr className="sidebar-separator" />

            <div className="sidebar-settings">
                <div className="sidebar-settings-title">SETTINGS</div>

                <div className="sidebar-setting-group">
                    <div className="sidebar-setting-label">Theme</div>
                    <Switch
                        id="theme-toggle"
                        checked={isDark}
                        onChange={(e) => setIsDark(e.target.checked)}
                        className="sidebar-switch-small-text"
                    >
                        {isDark ? 'Dark' : 'Light'}
                    </Switch>
                </div>

                <div className="sidebar-setting-group">
                    <div className="sidebar-setting-label">Language</div>
                    <select
                        value={language}
                        onChange={(e) => toggleLanguage(e.target.value)}
                        className="sidebar-select"
                    >
                        <option value="ja">Japanese</option>
                        <option value="en">English</option>
                    </select>
                </div>
            </div>
        </nav>
    );
}