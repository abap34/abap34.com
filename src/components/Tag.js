import { FaTag } from 'react-icons/fa';
import './Tag.css';

export default function Tag({ name, label, children }) {
    const handleClick = () => {
        const params = new URLSearchParams(window.location.search);
        params.append('tag', name || children);
        window.location.href = `/search?${params.toString()}`;
    }

    return (
        <span className="tag" onClick={handleClick}>
            <FaTag className="tag-icon" />
            {label || children}
        </span>
    );
}