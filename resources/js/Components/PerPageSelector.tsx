import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';

interface PerPageSelectorProps {
    currentPerPage: number;
}

export default function PerPageSelector({ currentPerPage }: PerPageSelectorProps) {
    const options = [10, 25, 50, 100];

    const handleChange = (value: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set('per_page', value.toString());
        params.delete('page');

        router.get(
            `${window.location.pathname}?${params.toString()}`,
            {},
            { preserveState: true, preserveScroll: false, replace: true }
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
        >
            <span className="text-sm text-gray-600 dark:text-gray-200">Show:</span>
            <select
                value={currentPerPage}
                onChange={(e) => handleChange(Number(e.target.value))}
                className="rounded-lg border border-gray-300 dark:bg-gray-600 dark:text-gray-200 px-3 py-2 text-sm focus:border-gray-500 focus:ring-gray-500"
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-200">per page</span>
        </motion.div>
    );
}
