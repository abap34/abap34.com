import { useContext, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LanguageContext from '../context/LanguageContext';
import SidebarContext from '../context/SidebarContext';
import { useTheme } from '../context/ThemeContext';
import { SIDEBAR_LINKS, useFocusContext } from '../context/FocusContext';
import './Sidebar.css';

const NAV_ITEMS = [
    { path: SIDEBAR_LINKS[0], label: 'About' },
    { path: SIDEBAR_LINKS[1], label: 'Background' },
    { path: SIDEBAR_LINKS[2], label: 'Works' },
    { path: SIDEBAR_LINKS[3], label: 'Blog' }
];

export default function Sidebar() {
    const { isDark, setIsDark } = useTheme();
    const { language, toggleLanguage } = useContext(LanguageContext);
    const { setIsOpen } = useContext(SidebarContext);
    const location = useLocation();
    const sidebarRef = useRef(null);
    const { focusState, activeFocusId } = useFocusContext();
    const focusedIndex = focusState.region === 'sidebar' ? focusState.sidebarIndex : -1;

    useEffect(() => {
        if (focusedIndex >= 0 && sidebarRef.current && focusState.region === 'sidebar') {
            const element = sidebarRef.current.querySelector(`[data-focus-id="sidebar-${focusedIndex}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [focusedIndex, focusState.region]);

    const linkClass = (path, focusId) =>
        `sidebar-link ${location.pathname === path ? 'active' : ''} ${activeFocusId === focusId ? 'keyboard-focused' : ''}`;

    const handleLinkClick = (path) => {
        if (window.innerWidth <= 768) {
            setIsOpen(false);
        }
    };

    return (
        <nav className="sidebar" ref={sidebarRef}>
            <column className="sidebar-container">
                <column className="sidebar-navigation">
                    <div className="sidebar-title">abap34.com/</div>
                    <column className="sidebar-links">
                        {NAV_ITEMS.map(({ path, label }, index) => (
                            <Link
                                key={path}
                                to={path}
                                className={linkClass(path, `sidebar-${index}`)}
                                onClick={() => handleLinkClick(path)}
                                data-focus-id={`sidebar-${index}`}
                            >
                                {index === NAV_ITEMS.length - 1 ? '└─ ' : '├─ '}
                                {` ${label}`}
                            </Link>
                        ))}
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
