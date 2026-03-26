import { useState } from 'react';
import { motion } from 'framer-motion';

interface CopyCommandCardProps {
    fadeUp: (delay?: number) => object;
}

export function CopyCommandCard({ fadeUp }: CopyCommandCardProps) {
    return (
        <motion.div
            {...fadeUp(0.25)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5"
        >
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Copy Incomplete Tasks
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                Run this to carry over unfinished tasks from yesterday.
            </p>
            <CopyCommand />
        </motion.div>
    );
}

const CMD = 'php artisan task:copy-incomplete';

function CopyCommand() {
    const [copied, setCopied] = useState(false);

    async function copy() {
        await navigator.clipboard.writeText(CMD);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 px-3 py-2">
            <code className="text-xs text-gray-700 dark:text-gray-300 truncate">{CMD}</code>
            <button
                onClick={copy}
                className="ml-2 shrink-0 text-xs px-2 py-1 rounded bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-800 hover:bg-gray-700 transition-colors"
            >
                {copied ? 'Copied!' : 'Copy'}
            </button>
        </div>
    );
}
