import { motion } from 'framer-motion';
import { RotateCcw, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { TrashItem, TrashType } from '@/Pages/Trash/types/trash';

interface Props {
    type: TrashType;
    items: TrashItem[];
    onRestore: (type: TrashType, item: TrashItem) => void;
    onForceDelete: (type: TrashType, item: TrashItem) => void;
}

export default function TrashList({ type, items, onRestore, onForceDelete }: Props) {
    if (items.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-16 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Nothing deleted here.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700/60">
            {items.map((item, index) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="flex flex-wrap items-start justify-between gap-4 px-5 py-4"
                >
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            {item.color && (
                                <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                            )}
                            <h3 className="font-medium text-gray-800 dark:text-gray-100 truncate">
                                {item.title}
                            </h3>
                        </div>

                        {item.subtitle && (
                            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 truncate">
                                {item.subtitle}
                            </p>
                        )}

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                            {item.deleted_at && (
                                <span>Deleted {format(parseISO(item.deleted_at), 'd MMM yyyy, HH:mm')}</span>
                            )}
                            {item.meta.map(chip => (
                                <span key={chip}>{chip}</span>
                            ))}
                            {item.cascade.length > 0 && (
                                <span className="text-amber-600 dark:text-amber-400">
                                    holds {item.cascade.join(' · ')}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            type="button"
                            onClick={() => onRestore(type, item)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <RotateCcw size={14} aria-hidden="true" />
                            Restore
                        </button>

                        <button
                            type="button"
                            onClick={() => onForceDelete(type, item)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-900/60 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <Trash2 size={14} aria-hidden="true" />
                            Delete forever
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
