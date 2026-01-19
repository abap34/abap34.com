import { FaTag } from 'react-icons/fa';
import './Tag.css';

export default function Tag({ name, label, children, variant = "foreground1", targetPage = "/search" }) {
    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const params = new URLSearchParams();
        params.append('tag', name || children);
        window.location.href = `${targetPage}?${params.toString()}`;
    }

    const displayText = label || children;
    const truncatedText = displayText.length > 15 ? displayText.substring(0, 15) + '...' : displayText;

    return (
        <span is-="badge" variant-={variant} onClick={handleClick}>
            <FaTag className="tag-icon" />
            {truncatedText}
        </span>
    );
}