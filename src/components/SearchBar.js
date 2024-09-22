import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';


function addSearchQuery(query) {
    const params = new URLSearchParams(window.location.search);
    params.append('q', query);
    window.location.href = `/search?${params.toString()}`;
}

export default function SearchBar({ placeholder = "Search Blog" }) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = () => {
        if (searchQuery) {
            addSearchQuery(searchQuery);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="relative flex-grow">
            <input
                type="text"
                placeholder={placeholder}
                className="w-full h-full px-4 py-2 border border-gray-300 rounded-md pr-10 focus:outline-none focus:ring focus:ring-blue-600 focus:border-blue-600 transition duration-300 placeholder-gray-400 dark:placeholder-gray-500 dark:bg-gray-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <button
                className="absolute right-2 top-2 text-gray-400"
                onClick={handleSearch}
                aria-label="Search"
            >
                <FaSearch />
            </button>
        </div>
    );
}