import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Background from './components/Background';
import Footer from './components/Footer';
import Header from './components/Header';
import SearchResult from './components/SearchResult';
import TopPage from './components/TopPage';
import Works from './components/Works';
import { LanguageContext, LanguageProvider } from "./context/LanguageContext";

function App() {
  return (
    <LanguageProvider>
      <Abap34Com />
    </LanguageProvider>
  );
}

function NotFound() {
  return (
      // 画像つき404ページ.
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-2xl">Page not found</p>
        <img src="/img/404.png" alt="404" className="w-1/4" />
        <a href="/" className="text-blue-500 hover:underline">▶︎ Back to home</a>
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
      <div className="bg-white text-gray-800 font-mono dark:bg-gray-900 dark:text-gray-200 h-full">
        <Header />
        <div className="min-h-screen max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<TopPage />} />
            <Route path="/background" element={<Background />} />
            <Route path="/works" element={<Works title="Projects" path={filename} defaultVisibleCount={6} />} />
            <Route path="/blog" element={<SearchResult />} />
            <Route path="/search" element={<SearchResult />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
