// resources/js/Pages/Notes/Components/ListNote/SearchBar.tsx

import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useRef } from 'react';

interface Props {
    value?: string;
}

export default function SearchBar({ value }: Props) {
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            router.get(
                route('notes.index'),
                { search: e.target.value || undefined },
                { preserveState: true, replace: true },
            );
        }, 300);
    };

    const handleClear = () => {
        router.get(route('notes.index'), {}, { preserveState: true, replace: true });
    };

    return (
        <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
            <input
                type="text"
                placeholder="Cari catatan..."
                defaultValue={value}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
                           pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400
                           dark:text-gray-200 dark:placeholder-gray-500"
            />
            {value && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    <X className="size-3.5" />
                </button>
            )}
        </div>
    );
}
