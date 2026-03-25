import { motion } from 'framer-motion';
import { Calendar, List, Columns3 } from 'lucide-react';

type View = 'calendar' | 'list' | 'board';

interface ViewToggleProps {
    view: View;
    onViewChange: (view: View) => void;
}

const VIEWS: { key: View; label: string; icon: React.ElementType }[] = [
    { key: 'calendar', label: 'Calendar', icon: Calendar },
    { key: 'list', label: 'List', icon: List },
    { key: 'board', label: 'Board', icon: Columns3 },
];

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        >
            {VIEWS.map(({ key, label, icon: Icon }) => {
                const isActive = view === key;
                return (
                    <button
                        key={key}
                        onClick={() => onViewChange(key)}
                        className={`
                            relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm
                            transition-colors duration-150 font-medium
                            ${isActive
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-700/50'
                            }
                        `}
                    >
                        <Icon size={14} strokeWidth={isActive ? 2 : 1.75} />
                        {label}
                    </button>
                );
            })}
        </motion.div>
    );
}
