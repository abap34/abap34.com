import { Tags } from 'lucide-react';
import Tag from './Tag';



export default function TagList({ allTags, header="Tags" }) {
    return (
        <div className="sticky top-24 overflow-y-scroll hidden lg:block space-y-8 max-h-[80vh] border-gray-200 rounded-lg px-2 py-4">
            <div className="flex items-center space-x-2 text-xl font-semibold">
                <Tags className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl font-bold"> {header} </h2>
            </div>

            <div className="gap-2 flex flex-wrap dark:border-gray-700 border p-4 rounded-lg">
                {allTags.map(([tag, count], index) => (
                    <Tag key={index} name={tag} label={`${tag} (${count})`} />
                ))}
            </div>

        </div>
    )
}
