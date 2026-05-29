import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, X } from 'lucide-react';
import { PageProps } from '@/types';
import ReminderList from './ReminderList';

/**
 * Global floating reminder widget — visible on every authenticated page.
 * Shows pinned notes so reminders are reachable from anywhere.
 */
export default function NotesReminderWidget() {
    const { reminders = [] } = usePage<PageProps>().props;
    const [open, setOpen] = useState(false);

    const count = reminders.length;

    return (
        <div className="fixed bottom-8 left-8 z-50">
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute bottom-16 left-0 w-80 max-w-[calc(100vw-4rem)] rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl shadow-gray-400/20 dark:shadow-black/40"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-4 py-3">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                                <StickyNote size={15} strokeWidth={1.75} />
                                Pengingat
                            </h3>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                aria-label="Tutup"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="max-h-80 overflow-y-auto p-3">
                            <ReminderList notes={reminders} onItemClick={() => setOpen(false)} />
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-2.5">
                            <Link
                                href={route('notes.index')}
                                onClick={() => setOpen(false)}
                                className="text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                            >
                                Buka semua notes →
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAB */}
            <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setOpen((prev) => !prev)}
                className="relative rounded-full bg-gray-800 hover:bg-gray-700 dark:bg-gray-100 dark:hover:bg-white p-3 text-white dark:text-gray-900 shadow-lg shadow-gray-500/30 dark:shadow-black/40 transition-colors"
                aria-label="Pengingat notes"
            >
                <StickyNote className="h-5 w-5" />
                {count > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none ring-2 ring-white dark:ring-gray-950">
                        {count > 99 ? '99+' : count}
                    </span>
                )}
            </motion.button>
        </div>
    );
}
