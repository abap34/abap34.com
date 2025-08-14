import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Background from './components/Background';
import Footer from './components/Footer';
import Header from './components/Header';
import SearchResult from './components/SearchResult';
import Sidebar from './components/Sidebar';
import TopPage from './components/TopPage';
import Works from './components/Works';
import { LanguageContext, LanguageProvider } from "./context/LanguageContext";

function PageWrapper({ children }) {
  return (
    <div style={{ flex: 1, padding: '1rem', width: 'calc(100% - 16rem)' }}>
      {children}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Abap34Com />
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
        {/* <Header /> */}
        <div 
          style={{
            display: 'flex',
            minHeight: '100vh',
            width: '100%',
            margin: '0',
            padding: '0'
          }}
        >
          <Routes>
            <Route path="/" element={<TopPage />} />
            <Route path="/background" element={<><Sidebar /><PageWrapper><Background /></PageWrapper></>} />
            <Route path="/works" element={<><Sidebar /><PageWrapper><Works title="Projects" path={filename} defaultVisibleCount={null} /></PageWrapper></>} />
            <Route path="/blog" element={<><Sidebar /><PageWrapper><SearchResult /></PageWrapper></>} />
            <Route path="/search" element={<><Sidebar /><PageWrapper><SearchResult /></PageWrapper></>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
