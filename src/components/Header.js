import { FaBars } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import React, { useContext } from 'react';
import SidebarContext from '../context/SidebarContext';

export default function Header() {
  const { toggleSidebar } = useContext(SidebarContext);

  return (
    <header 
      className="md:hidden border-b border-foreground2 py-1 sticky top-0 z-50 backdrop-blur-sm"
      style={{ backgroundColor: 'var(--background0)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="mr-4 p-2 rounded-md text-foreground1 hover:bg-background2">
            <FaBars />
          </button>
        </div>
      </div>
    </header>
  );
}
