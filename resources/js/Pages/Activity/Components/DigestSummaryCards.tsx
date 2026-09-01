import { DigestTotals } from '@/Pages/Activity/types/activity';

const CARDS: { key: keyof DigestTotals; label: string; accent: string }[] = [
    { key: 'active_tasks', label: 'Tasks touched', accent: 'text-gray-900 dark:text-gray-100' },
    { key: 'created', label: 'Created', accent: 'text-green-600 dark:text-green-400' },
    { key: 'completed', label: 'Completed', accent: 'text-green-600 dark:text-green-400' },
    { key: 'status_changed', label: 'Status moves', accent: 'text-blue-600 dark:text-blue-400' },
    { key: 'carried_over', label: 'Carried over', accent: 'text-amber-600 dark:text-amber-400' },
    { key: 'active_days', label: 'Active days', accent: 'text-gray-900 dark:text-gray-100' },
];

export default function DigestSummaryCards({ totals }: { totals: DigestTotals }) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {CARDS.map(card => (
                <div
                    key={card.key}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3"
                >
                    <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {card.label}
                    </div>
                    <div className={`text-2xl font-bold ${card.accent}`}>{totals[card.key]}</div>
                </div>
            ))}
        </div>
    );
}
