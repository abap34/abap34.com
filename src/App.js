import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Background from './components/Background';
import Header from './components/Header';
import SearchResult from './components/SearchResult';
import Sidebar from './components/Sidebar';
import TopPage from './components/TopPage';
import Works from './components/Works';
import { LanguageContext, LanguageProvider } from "./context/LanguageContext";
import SidebarContext, { SidebarProvider } from "./context/SidebarContext";

function PageWrapper({ children }) {
  return (
    <div className="flex-1 min-w-0 p-4">
      {children}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <SidebarProvider>
        <Abap34Com />
      </SidebarProvider>
    </LanguageProvider>
  );
}

function NotFound() {
  return (
    <div
      variant-="background0"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '1rem'
      }}
    >
      <h1
        variant-="foreground0"
        style={{ fontSize: '4rem', fontWeight: 'bold' }}
      >
        404
      </h1>
      <p
        variant-="foreground1"
        style={{ fontSize: '1.5rem' }}
      >
        Page not found
      </p>
      <img
        src="/img/404.png"
        alt="404"
        style={{ width: '25%', maxWidth: '200px' }}
      />
      <a
        href="/"
        variant-="accent0"
        style={{ textDecoration: 'none' }}
      >
        ▶︎ Back to home
      </a>
    </div>
  );
}


function Abap34Com() {
  const { language } = React.useContext(LanguageContext);
  const { isOpen, setIsOpen } = React.useContext(SidebarContext);
  const [filename, setFilename] = useState("/works.yaml");

  useEffect(() => {
    setFilename(language === "ja" ? "/works.yaml" : "/works_en.yaml");
  }, [language]);

  return (
    <Router>
      <div
        variant-="background0"
        style={{
          minHeight: '100vh',
          fontFamily: 'monospace'
        }}
      >
        <Header />
        <div className="flex min-h-screen relative">
          {/* デスクトップ用サイドバー */}
          <div className="hidden md:block flex-shrink-0">
            <Sidebar />
          </div>

          {/* モバイル用オーバーレイサイドバー */}
          {isOpen && (
            <div className="md:hidden fixed top-10 left-0 right-0 bottom-0 z-40">
              <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={() => setIsOpen(false)}
              ></div>
              {/* サイドバー */}
              <div
                className="relative w-64 h-full shadow-2xl border-r border-foreground2"
                onClick={(e) => e.stopPropagation()}
                style={{ backgroundColor: 'var(--background0)' }}
              >
                <Sidebar />
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <Routes>
              <Route path="/" element={<TopPage />} />
              <Route path="/background" element={<PageWrapper><Background /></PageWrapper>} />
              <Route path="/works" element={<PageWrapper><Works title="Projects" path={filename} defaultVisibleCount={null} /></PageWrapper>} />
              <Route path="/blog" element={<PageWrapper><SearchResult /></PageWrapper>} />
              <Route path="/search" element={<PageWrapper><SearchResult /></PageWrapper>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
