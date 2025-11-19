import { cn } from '../utils/cn';
import Tag from './Tag';

export default function TagList({ allTags, header = "Tags", className, targetPage = "/search" }) {
    return (
        <div className={cn("hidden lg:block space-y-8 border-gray-200 rounded-lg px-2 py-4", className)}>
            <div className="flex items-center space-x-2 text-xl font-semibold">
                <h2 className="text-2xl font-bold"> {header} </h2>
            </div>

            <div className="gap-2 flex flex-wrap dark:border-gray-700 border p-4 rounded-lg">
                {allTags.map(([tag, count], index) => (
                    <Tag key={index} name={tag} label={`${tag} (${count})`} targetPage={targetPage} />
                ))}
            </div>

        </div>
    )
}
