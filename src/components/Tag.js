import { FaTag } from 'react-icons/fa';


export default function Tag({ name, label }) {
    const handleClick = () => {
        const params = new URLSearchParams(window.location.search);
        params.append('tag', name);
        window.location.href = `/search?${params.toString()}`;
    }

    return (
        <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg space-x-1 word-break-all truncate cursor-pointer">
            <FaTag className="inline-block mr-1" />
            <span onClick={handleClick}>{label}</span>
        </span>
    );
}