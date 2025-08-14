import React, { useContext, useState } from 'react';
import SidebarContext from '../context/SidebarContext';

export default function Header() {
  const { toggleSidebar } = useContext(SidebarContext);
  const [isThree, setIsThree] = useState(true);

  const handlePlusClick = () => {
    if (isThree) {
      setIsThree(false);
    }
  };

  return (
    <header 
      className="md:hidden border-b border-foreground2 py-1 sticky top-0 z-50 backdrop-blur-sm"
      style={{ backgroundColor: 'var(--background0)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="mr-2 p-2 rounded-md text-foreground1 hover:bg-background2">
            <span style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>
              {isThree ? '三' : '四'}
            </span>
          </button>
          <button onClick={handlePlusClick} className="p-2 rounded-md text-foreground1 hover:bg-background2">
            <span style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>
              ＋
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
