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
      <row className="header-container">
        <row className="header-controls">
          <button is-="button" variant-="background2" onClick={toggleSidebar} className="header-button">
            {isThree ? '三' : '四'}
          </button>
          <button is-="button" variant-="background2" onClick={handlePlusClick} className="header-button">
            ＋
          </button>
        </row>
      </row>
    </header>
  );
}
