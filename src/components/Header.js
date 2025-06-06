import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useContext, useEffect, useState } from 'react';
import { FaBars, FaMoon, FaSun } from 'react-icons/fa';
import { FaArrowsRotate } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import LanguageContext from '../context/LanguageContext';

export default function Header() {
  const BIG_ICON_SIZE = 24;
  const SMALL_ICON_SIZE = 10;
  const isDarkOS = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const [isDark, setIsDark] = useState(isDarkOS);
  const { language, toggleLanguage } = useContext(LanguageContext);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);


  return (
    <header className="border-b border-gray-200 py-4 dark:border-gray-800 sticky  bg-white dark:bg-gray-900 dark:text-gray-200 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div>
            <button onClick={() => setIsDark(!isDark)}>
              {isDark ? (
                <div className="flex">
                  <FaSun size={BIG_ICON_SIZE} />
                  <FaArrowsRotate size={SMALL_ICON_SIZE} />
                  <FaMoon size={SMALL_ICON_SIZE} />
                </div>
              ) : (
                <div className="flex">
                  <FaMoon size={BIG_ICON_SIZE} />
                  <FaArrowsRotate size={SMALL_ICON_SIZE} />
                  <FaSun size={SMALL_ICON_SIZE} />
                </div>
              )}
            </button>
          </div>
          <select
            value={language}
            onChange={(e) => {
              toggleLanguage(e.target.value);
            }}
            className="text-gray-600 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700 border border-gray-200 rounded-md px-2 py-1"
          >
            <option value="ja">Japanese</option>
            <option value="en">English (β)</option>
          </select>
        </div>


        <nav className="hidden lg:flex space-x-4 items-center text-gray-600 dark:text-gray-400 md:space-x-8">
          <Link to="/"> About </Link>
          <Link to="/background"> Background </Link>
          <Link to="/works"> Works </Link>
          {/* <Link to="/articles"> Articles </Link> */}
          <Link to="/blog"> Blog </Link>
        </nav>


        {/* Note: モバイルだと普通の nav がはみ出るので、ハンバーガーメニューを表示 */}
        <div className="lg:hidden">
          <Menu as="div" className="relative">
            <MenuButton className="text-gray-600 dark:text-gray-400">
              <FaBars size={BIG_ICON_SIZE} />
            </MenuButton>
            <MenuItems className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md focus:outline-none">
              <MenuItem>
                {({ active }) => (
                  <Link
                    to="/"
                    className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  >
                    About
                  </Link>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <Link
                    to="/background"
                    className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  >
                    Background
                  </Link>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <Link
                    to="/works"
                    className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  >
                    Works
                  </Link>
                )}
              </MenuItem>
              {/* <MenuItem>
                {({ active }) => (
                  <Link
                    to="/articles"
                    className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  >
                    Articles
                  </Link>
                )}
              </MenuItem> */}
              <MenuItem>
                {({ active }) => (
                  <Link
                    to="/blog"
                    className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  >
                    Blog
                  </Link>
                )}
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>

      </div>
    </header>
  );
}
