import { useState } from 'react';
import { router } from '@inertiajs/react';
import { ActivityFilters, ActivityPreset, DigestProject } from '@/Pages/Activity/types/activity';

interface DigestFiltersProps {
    filters: ActivityFilters;
    projects: DigestProject[];
}

const PRESETS: { value: Exclude<ActivityPreset, 'custom'>; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'Last 7 days' },
    { value: 'month', label: 'Last 30 days' },
];

export default function DigestFilters({ filters, projects }: DigestFiltersProps) {
    const [range, setRange] = useState({ from: filters.from, to: filters.to });

    const visit = (params: Record<string, string | null>) => {
        router.get(route('activity.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const applyPreset = (preset: ActivityPreset) => {
        visit({ preset, project_id: filters.project_id });
    };

    const applyRange = (next: { from: string; to: string }) => {
        setRange(next);

        if (next.from && next.to && next.from <= next.to) {
            visit({ from: next.from, to: next.to, project_id: filters.project_id });
        }
    };

    const isRangeInvalid = Boolean(range.from && range.to && range.from > range.to);

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                {PRESETS.map(preset => (
                    <button
                        key={preset.value}
                        type="button"
                        onClick={() => applyPreset(preset.value)}
                        aria-pressed={filters.preset === preset.value}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                            filters.preset === preset.value
                                ? 'bg-blue-600 text-white dark:bg-blue-500'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap items-end gap-4">
                <div>
                    <label
                        htmlFor="digest-from"
                        className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1"
                    >
                        From
                    </label>
                    <input
                        id="digest-from"
                        type="date"
                        value={range.from}
                        onChange={(e) => applyRange({ ...range, from: e.target.value })}
                        className="rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label
                        htmlFor="digest-to"
                        className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1"
                    >
                        To
                    </label>
                    <input
                        id="digest-to"
                        type="date"
                        value={range.to}
                        onChange={(e) => applyRange({ ...range, to: e.target.value })}
                        className="rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div className="min-w-[12rem]">
                    <label
                        htmlFor="digest-project"
                        className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1"
                    >
                        Project
                    </label>
                    <select
                        id="digest-project"
                        value={filters.project_id ?? ''}
                        onChange={(e) =>
                            visit({
                                preset: filters.preset === 'custom' ? null : filters.preset,
                                from: filters.preset === 'custom' ? filters.from : null,
                                to: filters.preset === 'custom' ? filters.to : null,
                                project_id: e.target.value || null,
                            })
                        }
                        className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 cursor-pointer"
                    >
                        <option value="">All projects</option>
                        {projects.map(project => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {isRangeInvalid && (
                <p className="text-sm text-red-600 dark:text-red-400">
                    The end date has to be on or after the start date.
                </p>
            )}
        </div>
    );
}
