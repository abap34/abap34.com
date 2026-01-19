import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Works from './pages/Works';
import Blog from './pages/Blog';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/works" element={<Works />} />
                <Route path="/blog" element={<Blog />} />
              </Routes>
            </main>
          </div>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
