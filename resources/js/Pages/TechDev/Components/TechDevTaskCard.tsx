import { motion } from 'framer-motion';
import { MoreVertical, Folder } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { TechDevTask } from '../types/TechDevTask';

interface Props {
    task: TechDevTask;
    index: number;
    onEdit: (task: TechDevTask) => void;
    onView: (task: TechDevTask) => void;
}

export default function TechDevTaskCard({ task, index, onEdit, onView }: Props) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-5 cursor-pointer border border-gray-200 dark:border-gray-700"
            onClick={() => onView(task)}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                        {task.title}
                    </h3>
                </div>

                <div className="relative ml-2" ref={menuRef}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <MoreVertical size={18} />
                    </button>

                    {showMenu && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-10"
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onView(task);
                                    setShowMenu(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-md"
                            >
                                View Details
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(task);
                                    setShowMenu(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-b-md"
                            >
                                Edit
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Project Badge */}
            {task.project && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: task.project.color || '#6B7280' }}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
                        <Folder size={12} />
                        {task.project.name}
                    </span>
                </div>
            )}

            {/* Date */}
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                Created {new Date(task.created_at).toLocaleDateString()}
            </div>
        </motion.div>
    );
}
