import { useContext, useState } from 'react';
import SidebarContext from '../context/SidebarContext';
import './Header.css';

export default function Header() {
  const { toggleSidebar } = useContext(SidebarContext);
  const [isThree, setIsThree] = useState(true);

  const handlePlusClick = () => {
    if (isThree) {
      setIsThree(false);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-controls">
          <button onClick={toggleSidebar} className="header-button">
            {isThree ? '三' : '四'}
          </button>
          <button onClick={handlePlusClick} className="header-button">
            ＋
          </button>
        </div>
      </div>
    </header>
  );
}
