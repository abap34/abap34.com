import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Blog from './components/Blog';
import Education from './components/Education';
import Footer from './components/Footer';
import Header from './components/Header';
import SearchResult from './components/SearchResult';
import TopPage from './components/TopPage';
import Works from './components/Works';

function App() {
  return (
    <Router>
      <div className="bg-white text-gray-800 font-mono dark:bg-gray-900 dark:text-gray-200 h-full">
        <Header />
        <div className="min-h-screen max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<TopPage />} />
            <Route path="/education" element={<Education />} />
            <Route path="/works" element={<Works title="Projects" path="/works/works.yaml" defaultVisibleCount={3} />} />
            <Route path="/articles" element={<Works title="Articles" path="/works/articles.yaml" defaultVisibleCount={2} />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/search" element={<SearchResult />} />
          </Routes>
        </div>

        <Footer />

      </div>
    </Router>

  );
}

export default App;