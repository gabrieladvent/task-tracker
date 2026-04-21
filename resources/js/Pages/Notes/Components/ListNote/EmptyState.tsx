// resources/js/Pages/Notes/Components/ListNote/EmptyState.tsx

import { motion } from 'framer-motion';
import { NotebookPen } from 'lucide-react';

interface Props {
    onCreateClick: () => void;
}

export default function EmptyState({ onCreateClick }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-28 text-center"
        >
            <div className="mb-5 rounded-2xl bg-gray-100 dark:bg-gray-800 p-5">
                <NotebookPen className="size-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Belum ada catatan
            </h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 max-w-xs">
                Buat catatan pertama kamu untuk mulai mengorganisir ide dan pikiran.
            </p>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCreateClick}
                className="rounded-md bg-gray-800 dark:bg-gray-100 dark:text-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
            >
                Buat Note Pertama
            </motion.button>
        </motion.div>
    );
}
