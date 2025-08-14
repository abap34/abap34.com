import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { FaBars } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Header() {
  const BIG_ICON_SIZE = 24;


  return (
    <header 
      variant-="background0"
      style={{
        borderBottom: '1px solid var(--foreground2)',
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div 
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div style={{ fontFamily: 'var(--font-family)', fontWeight: 'var(--font-weight-bold)', color: 'var(--foreground0)' }}>
          abap34.com
        </div>
      </div>
    </header>
  );
}
