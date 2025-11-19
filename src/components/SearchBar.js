import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import './SearchBar.css';

export default function SearchBar({ placeholder = "Search Blog", targetPage = "/search" }) {
    const [searchQuery, setSearchQuery] = useState('');

    const addSearchQuery = (query) => {
        const params = new URLSearchParams(window.location.search);
        params.append('q', query);
        window.location.href = `${targetPage}?${params.toString()}`;
    };

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
        <div className="search-bar-container">
            <input
                is-="input"
                type="text"
                placeholder={placeholder}
                className="search-bar-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <button
                is-="button"
                variant-="blue"
                className="search-bar-button"
                onClick={handleSearch}
                aria-label="Search"
            >
                <FaSearch />
            </button>
        </div>
    );
}