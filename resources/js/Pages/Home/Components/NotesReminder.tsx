import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { StickyNote } from 'lucide-react';
import { PageProps } from '@/types';
import ReminderList from '@/Components/Notes/ReminderList';

interface Props {
    fadeUp: (delay?: number) => object;
}

export function NotesReminder({ fadeUp }: Props) {
    const { reminders = [] } = usePage<PageProps>().props;

    return (
        <motion.div
            {...fadeUp(0.25)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6"
        >
            <div className="flex items-center justify-between mb-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                    <StickyNote size={15} strokeWidth={1.75} />
                    Pengingat
                </h2>
                <Link
                    href={route('notes.index')}
                    className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                    Lihat semua
                </Link>
            </div>

            <ReminderList notes={reminders} />
        </motion.div>
    );
}
