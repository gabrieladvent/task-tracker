import { router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SearchBarProps {
    initialSearch?: string;
    placeholder?: string;
    onSearch?: (value: string) => void;
}

export default function SearchBar({
    initialSearch = '',
    placeholder = 'Search...',
    onSearch
}: SearchBarProps) {
    const [search, setSearch] = useState(initialSearch);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (onSearch) {
                onSearch(search);
            } else {
                router.get(
                    window.location.pathname,
                    { search, per_page: new URLSearchParams(window.location.search).get('per_page') || 10 },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    }
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
        >
            <div className="relative">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-gray-500 focus:ring-gray-500 text-sm"
                />
                <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </div>
        </motion.div>
    );
}
