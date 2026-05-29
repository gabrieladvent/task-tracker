import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CalendarDays, CalendarRange, FolderOpen, BarChart2, Wrench, StickyNote } from 'lucide-react';

interface Props {
    fadeUp: (delay?: number) => object;
}

const QUICK_LINKS = [
    { label: 'Current Period', routeName: 'periods.last', icon: CalendarDays },
    { label: 'All Periods', routeName: 'periods.index', icon: CalendarRange },
    { label: 'Projects', routeName: 'projects.index', icon: FolderOpen },
    { label: 'Reports', routeName: 'reports.index', icon: BarChart2 },
    { label: 'Tech Dev', routeName: 'tech-dev.index', icon: Wrench },
    { label: 'Notes', routeName: 'notes.index', icon: StickyNote },
] as const;

export function QuickLinks({ fadeUp }: Props) {
    return (
        <motion.div
            {...fadeUp(0.2)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6"
        >
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Quick Links</h2>
            <div className="flex flex-col gap-1">
                {QUICK_LINKS.map(({ label, routeName, icon: Icon }) => (
                    <Link
                        key={routeName}
                        href={route(routeName)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                        <Icon size={15} strokeWidth={1.75} />
                        {label}
                    </Link>
                ))}
            </div>
        </motion.div>
    );
}
