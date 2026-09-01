import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { DigestDay } from '@/Pages/Activity/types/activity';
import DigestTaskGroup from './DigestTaskGroup';

const SUMMARY_CHIPS: { key: keyof DigestDay['summary']; label: string; className: string }[] = [
    { key: 'created', label: 'created', className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
    { key: 'completed', label: 'completed', className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
    { key: 'status_changed', label: 'status moves', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    { key: 'carried_over', label: 'carried over', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    { key: 'updated', label: 'edits', className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200' },
];

export default function DigestDayCard({ day }: { day: DigestDay }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            <button
                type="button"
                onClick={() => setIsOpen(open => !open)}
                aria-expanded={isOpen}
                className="flex w-full flex-wrap items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
            >
                <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform ${isOpen ? '' : '-rotate-90'}`}
                    aria-hidden="true"
                />

                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{day.day_name}</h3>
                        {day.is_today && (
                            <span className="rounded-md bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-300">
                                Today
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{day.formatted_date}</div>
                </div>

                <div className="ml-auto flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {day.tasks.length} task{day.tasks.length === 1 ? '' : 's'}
                    </span>
                    {SUMMARY_CHIPS.filter(chip => day.summary[chip.key] > 0).map(chip => (
                        <span
                            key={chip.key}
                            className={`rounded-md px-2 py-0.5 text-xs font-medium ${chip.className}`}
                        >
                            {day.summary[chip.key]} {chip.label}
                        </span>
                    ))}
                </div>
            </button>

            {isOpen && (
                <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 p-5">
                    {day.tasks.map(group => (
                        <DigestTaskGroup key={group.root_task_id} group={group} />
                    ))}
                </div>
            )}
        </section>
    );
}
