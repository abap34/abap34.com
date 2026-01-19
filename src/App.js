import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './components/App.css';
import Background from './components/Background';
import Header from './components/Header';
import ParticleLife from './components/ParticleLife';
import SearchResult from './components/SearchResult';
import Sidebar from './components/Sidebar';
import TopPage from './components/TopPage';
import Works from './components/Works';
import GuideModal from './components/GuideModal';
import { FocusProvider } from "./context/FocusContext";
import { LanguageContext, LanguageProvider } from "./context/LanguageContext";
import SidebarContext, { SidebarProvider } from "./context/SidebarContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useYamlData } from "./hooks/useYamlData";

function PageWrapper({ children }) {
  return (
    <div className="page-wrapper">
      {children}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SidebarProvider>
          <Abap34Com />
        </SidebarProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

function NotFound() {
  const { data: uiText, isLoading } = useYamlData("/data/ui-text.yaml");

  if (isLoading || !uiText) {
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
        <p variant-="foreground1">Loading...</p>
      </div>
    );
  }

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
        {uiText.notFound.title}
      </h1>
      <p
        variant-="foreground1"
        style={{ fontSize: '1.5rem' }}
      >
        {uiText.notFound.message}
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
        {uiText.notFound.backToHome}
      </a>
    </div>
  );
}


function Abap34Com() {
  const { language } = React.useContext(LanguageContext);
  const { isOpen, setIsOpen } = React.useContext(SidebarContext);
  const [filename, setFilename] = useState("/data/works.yaml");
  const { data: uiText } = useYamlData("/data/ui-text.yaml");

  useEffect(() => {
    setFilename(language === "ja" ? "/data/works.yaml" : "/data/works_en.yaml");
  }, [language]);

  return (
    <Router>
      <FocusProvider>
        <div
          variant-="background0"
          className="app-layout"
        >
          <ParticleLife />
          <Header />
          <div className="app-main">
            {/* デスクトップ用サイドバー */}
            <div className="app-sidebar-desktop">
              <Sidebar />
            </div>

            {/* モバイル用オーバーレイサイドバー */}
            {isOpen && (
              <div className="app-sidebar-mobile">
                <div
                  className="app-sidebar-overlay"
                  onClick={() => setIsOpen(false)}
                ></div>
                {/* サイドバー */}
                <div
                  className="app-sidebar-panel"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Sidebar />
                </div>
              </div>
            )}

            <div className="app-content">
              <Routes>
                <Route path="/" element={<TopPage />} />
                <Route path="/background" element={<PageWrapper><Background /></PageWrapper>} />
                <Route path="/works" element={<PageWrapper><Works title={uiText?.sections.projects || "Projects"} path={filename} defaultVisibleCount={null} showTagFilter={true} /></PageWrapper>} />
                <Route path="/blog" element={<PageWrapper><SearchResult /></PageWrapper>} />
                <Route path="/search" element={<PageWrapper><SearchResult /></PageWrapper>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
          <GuideModal />
        </div>
      </FocusProvider>
    </Router>
  );
}

export default App;
