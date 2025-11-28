import { motion } from 'framer-motion';

interface ViewToggleProps {
    view: 'calendar' | 'list';
    onViewChange: (view: 'calendar' | 'list') => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex rounded-lg border border-gray-300 bg-white"
        >
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onViewChange('calendar')}
                className={`rounded-l-lg px-4 py-2 text-sm font-medium transition-colors ${view === 'calendar'
                        ? 'bg-gray-800 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
            >
                Calendar
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onViewChange('list')}
                className={`rounded-r-lg px-4 py-2 text-sm font-medium transition-colors ${view === 'list'
                        ? 'bg-gray-800 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
            >
                List
            </motion.button>
        </motion.div>
    );
}
