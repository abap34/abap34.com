import { FaTag } from 'react-icons/fa';


export default function Tag({ name, label }) {
    const handleClick = () => {
        const params = new URLSearchParams(window.location.search);
        params.append('tag', name);
        window.location.href = `/search?${params.toString()}`;
    }

    return (
        <span is-="badge" onClick={handleClick} style={{ cursor: 'pointer' }}>
            <FaTag className="inline-block mr-1" />
            {label}
        </span>
    );
}