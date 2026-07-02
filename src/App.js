import React, { useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Works from './pages/Works';
import Blog from './pages/Blog';
import './App.css';

function App() {
  const [abapNumber, setAbapNumber] = useState(34);
  const hasShownSyntheticClickAlert = useRef(false);

  const incrementAbapNumber = (event) => {
    if (!event.isTrusted) {
      if (!hasShownSyntheticClickAlert.current) {
        hasShownSyntheticClickAlert.current = true;
        alert('No pain, no gain.');
      }
      return;
    }

    setAbapNumber((current) => current + 1);
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <div className="app">
            <Navbar onIncrementAbapNumber={incrementAbapNumber} />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home abapNumber={abapNumber} />} />
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
