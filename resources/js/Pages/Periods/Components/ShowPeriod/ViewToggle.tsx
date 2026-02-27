import { motion } from 'framer-motion';

interface ViewToggleProps {
    view: 'calendar' | 'list' | 'board';
    onViewChange: (view: 'calendar' | 'list' | 'board') => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
    const buttons: { key: 'calendar' | 'list' | 'board'; label: string }[] = [
        { key: 'calendar', label: 'Calendar' },
        { key: 'list', label: 'List' },
        { key: 'board', label: 'Board' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 overflow-hidden"
        >
            {buttons.map(({ key, label }, idx) => (
                <motion.button
                    key={key}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onViewChange(key)}
                    className={`px-4 py-2 text-sm font-medium transition-colors
                        ${idx > 0 ? 'border-l border-gray-300 dark:border-slate-600' : ''}
                        ${view === key
                            ? 'bg-gray-800 dark:bg-slate-600 text-white shadow-sm'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }
                    `}
                >
                    {label}
                </motion.button>
            ))}
        </motion.div>
    );
}
