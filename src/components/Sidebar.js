import React, { useContext, useEffect, useState } from 'react';
import LanguageContext from '../context/LanguageContext';
import { Switch } from '../design-system';

export default function Sidebar() {
    const isDarkOS = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const [isDark, setIsDark] = useState(isDarkOS);
    const { language, toggleLanguage } = useContext(LanguageContext);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-webtui-theme', 'catppuccin-mocha');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.removeAttribute('data-webtui-theme');
        }
    }, [isDark]);
    return (
        <nav 
            style={{
                width: '16rem',
                borderRight: '1px solid var(--foreground2)',
                padding: '1rem',
                backgroundColor: 'var(--background1)',
                overflowY: 'auto',
                position: 'sticky',
                top: 0,
                height: '100vh'
            }}
        >
            <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground0)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                EXPLORER
            </div>
            <div style={{ fontFamily: 'monospace', lineHeight: '1.2' }}>
                <div style={{ marginBottom: '0.25rem', color: 'var(--foreground1)', fontSize: '0.875rem' }}>
                    abap34.com/
                </div>
                <div>
                    <a href="/" style={{ 
                        display: 'block', 
                        color: window.location.pathname === '/' ? 'var(--accent0)' : 'var(--foreground1)', 
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        padding: '0.125rem 0',
                        cursor: 'pointer'
                    }}>
                        ├─ About
                    </a>
                    <a href="/background" style={{ 
                        display: 'block', 
                        color: window.location.pathname === '/background' ? 'var(--accent0)' : 'var(--foreground1)', 
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        padding: '0.125rem 0',
                        cursor: 'pointer'
                    }}>
                        ├─ Background
                    </a>
                    <a href="/works" style={{ 
                        display: 'block', 
                        color: window.location.pathname === '/works' ? 'var(--accent0)' : 'var(--foreground1)', 
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        padding: '0.125rem 0',
                        cursor: 'pointer'
                    }}>
                        ├─ Works
                    </a>
                    <a href="/blog" style={{ 
                        display: 'block', 
                        color: window.location.pathname === '/blog' ? 'var(--accent0)' : 'var(--foreground1)', 
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        padding: '0.125rem 0',
                        cursor: 'pointer'
                    }}>
                        └─ Blog
                    </a>
                </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--foreground2)', margin: '1rem 0' }} />
            
            <div style={{ fontSize: '0.875rem' }}>
                <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground0)', marginBottom: '0.75rem' }}>
                    SETTINGS
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ marginBottom: '0.5rem', color: 'var(--foreground1)' }}>Theme</div>
                    <Switch 
                        id="theme-toggle"
                        checked={isDark}
                        onChange={(e) => setIsDark(e.target.checked)}
                        style={{ fontSize: '0.75rem' }}
                    >
                        {isDark ? 'Dark' : 'Light'}
                    </Switch>
                </div>

                <div>
                    <div style={{ marginBottom: '0.5rem', color: 'var(--foreground1)' }}>Language</div>
                    <select
                        value={language}
                        onChange={(e) => {
                            toggleLanguage(e.target.value);
                        }}
                        style={{
                            border: '1px solid var(--foreground2)',
                            borderRadius: '0.25rem',
                            padding: '0.25rem 0.5rem',
                            backgroundColor: 'var(--background0)',
                            color: 'var(--foreground0)',
                            fontFamily: 'var(--font-family)',
                            fontSize: '0.75rem',
                            width: '100%'
                        }}
                    >
                        <option value="ja">Japanese</option>
                        <option value="en">English</option>
                    </select>
                </div>
            </div>
        </nav>
    );
}