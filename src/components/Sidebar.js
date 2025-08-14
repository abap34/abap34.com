import { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LanguageContext from '../context/LanguageContext';
import { Switch } from '../design-system';

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
        `block text-sm no-underline py-0 cursor-pointer ${location.pathname === path ? 'text-accent0' : 'text-foreground1'
        }`;

    return (
        <nav className="w-64 h-full md:h-screen md:sticky md:top-0 border-r border-foreground2 p-4 bg-background0 overflow-y-auto z-10">
            <div className="font-mono leading-none">
                <div className="mb-1 text-foreground0 font-bold text-base">abap34.com/</div>
                <div className="text-xs">
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

            <hr className="border-t border-foreground2 my-4" />

            <div className="text-sm">
                <div className="font-bold text-foreground0 mb-3">SETTINGS</div>

                <div className="mb-4">
                    <div className="mb-2 text-foreground1">Theme</div>
                    <Switch
                        id="theme-toggle"
                        checked={isDark}
                        onChange={(e) => setIsDark(e.target.checked)}
                        className="text-xs"
                    >
                        {isDark ? 'Dark' : 'Light'}
                    </Switch>
                </div>

                <div>
                    <div className="mb-2 text-foreground1">Language</div>
                    <select
                        value={language}
                        onChange={(e) => toggleLanguage(e.target.value)}
                        className="border border-foreground2 rounded p-1 bg-background0 text-foreground0 font-mono text-xs w-full"
                    >
                        <option value="ja">Japanese</option>
                        <option value="en">English</option>
                    </select>
                </div>
            </div>
        </nav>
    );
}