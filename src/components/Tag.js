import { FaTag } from 'react-icons/fa';
import './Tag.css';

export default function Tag({ name, label, children, variant = "foreground1" }) {
    const handleClick = () => {
        const params = new URLSearchParams(window.location.search);
        params.append('tag', name || children);
        window.location.href = `/search?${params.toString()}`;
    }

    return (
        <span is-="badge" variant-={variant} onClick={handleClick}>
            <FaTag className="tag-icon" />
            {label || children}
        </span>
    );
}