import { ArrowRight, Tags, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FaRss } from 'react-icons/fa';
import swal from 'sweetalert2';
import SearchBar from './SearchBar';
import Tag from './Tag';
import TagList from './TagList';

async function fetchPosts() {
    try {
        const response = await fetch('https://www.abap34.com/posts.json');
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
    }
}

function copyRSS() {
    navigator.clipboard.writeText('https://www.abap34.com/rss.xml');
    swal.fire({
        title: 'Copied RSS URL',
        text: 'The RSS URL has been copied to the clipboard.',
        icon: 'success',
        timer: 2000,
        confirmButtonText: 'OK'
    });
}

function BlogTimeline({ posts }) {
    return (
        <div className="container mx-a px-2 py-8">
            <div className="relative  mx-auto md:w-full">
                <div
                    className="absolute left-4 top-0 h-full w-1 dark:bg-blue-200 bg-blue-200"
                    aria-hidden="true"
                >
                </div>

                {posts.map((post, index) => (
                    <div key={index} className="relative space-y-4 pl-12 mb-8">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {post.post_date}
                        </p>

                        <a href={post.url} target="_blank" rel="noreferrer" className="border border-gray-200 rounded-lg p-4 hover:border-blue-600 transition duration-300 block">
                            <h3 className="text-lg font-semibold mb-4 mt-2">{post.title}</h3>

                            <img src={post.thumbnail_url} alt={post.title} className="w-full h-48 object-cover rounded-lg mb-2" />
                            <p className="text-sm text-gray-600 mb-2 truncate dark:text-gray-400">{post.content}</p>

                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag, index) => (
                                    <Tag key={index} name={tag} label={tag} />
                                ))}
                            </div>

                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}



export default function Blog() {
    const [posts, setPosts] = useState([]);
    const [allTags, setAllTags] = useState([]);

    useEffect(() => {
        fetchPosts().then((posts) => {
            setPosts(posts);
        });
    }, []);

    useEffect(() => {
        const tags = posts.reduce((acc, post) => {
            post.tags.forEach((tag) => {
                if (acc[tag]) {
                    acc[tag] += 1;
                } else {
                    acc[tag] = 1;
                }
            });
            return acc;
        }, {});
        const sortedTags = Object.entries(tags).sort((a, b) => b[1] - a[1]);
        setAllTags(sortedTags);
    }, [posts]);

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h1 className="text-4xl font-bold">
                        <span className="text-blue-600">abap34</span>'s Blog
                    </h1>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded flex items-center space-x-2 transition duration-300 dark:bg-orange-400 hidden lg:flex" onClick={copyRSS}>
                        <FaRss className="mr-2" />
                        Copy RSS URL
                    </button>
                    <div className="flex space-x-2">
                        <SearchBar />
                    </div>
                </div>
                <div className="flex justify-center items-center">
                    <img src="/icon.png" alt="Blog Icon" className="max-w-full h-auto" />
                </div>
            </div>

            <div className="grid lg:grid-cols-[4fr,1fr] gap-8 md:grid-cols-1 px-0 py-4 lg:px-4">
                <div className="space-y-8 border-gray-200 rounded-lg lg:p-2 md:p-2 dark:border-gray-700 overflow-y-scroll">
                    <div className="flex items-center space-x-2 text-xl font-semibold">
                        <TrendingUp className="w-6 h-6 text-green-500" />
                        <h2 className="text-2xl font-bold"> Recent Posts </h2>

                    </div>

                    <a href="/search" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1">
                        (View All)
                        <ArrowRight className="w-4 h-4" />
                    </a>

                    <BlogTimeline posts={posts.slice(0, 10)} />
                </div>

                <TagList allTags={allTags} />

            </div>
        </main>
    );
}
