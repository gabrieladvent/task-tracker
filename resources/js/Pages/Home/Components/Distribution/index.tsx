import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProjectDistribution as Distribution } from '../../types/dashboard';
import { BarView } from './BarView';
import { BubbleView } from './BubbleView';
import { DonutView } from './DonutView';
import { RadarView } from './RadarView';
import { TreemapView } from './TreemapView';

interface Props {
    distribution: Distribution;
    fadeUp: (delay?: number) => object;
}

type Scope = 'period' | 'all';
type View = 'bubble' | 'treemap' | 'donut' | 'bar' | 'radar';

const SCOPES: { key: Scope; label: string }[] = [
    { key: 'period', label: 'This period' },
    { key: 'all', label: 'All time' },
];

const VIEWS: { key: View; label: string; minRows?: number }[] = [
    { key: 'bubble', label: 'Bubble' },
    { key: 'treemap', label: 'Treemap' },
    { key: 'donut', label: 'Donut' },
    { key: 'bar', label: 'Bars' },
    // A radar needs at least a triangle to read as a shape.
    { key: 'radar', label: 'Radar', minRows: 3 },
];

export function ProjectDistribution({ distribution, fadeUp }: Props) {
    const [scope, setScope] = useState<Scope>('period');
    const [view, setView] = useState<View>('bubble');

    const active = distribution[scope];
    const rows = active.rows.filter((row) => row.total > 0);
    const emptyProjects = active.rows.length - rows.length;

    const supported = (option: (typeof VIEWS)[number]) => rows.length >= (option.minRows ?? 1);
    const currentView = VIEWS.find((option) => option.key === view);
    const resolvedView = currentView && supported(currentView) ? view : 'bubble';

    // Bubble and treemap carry no labels of their own for the small slices, so
    // they get a legend underneath; bars already name every project inline.
    const needsLegend = resolvedView !== 'bar';

    return (
        <motion.div
            {...fadeUp(0.2)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6"
        >
            <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Task Distribution</h2>

                <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-0.5 shrink-0">
                    {SCOPES.map((option) => (
                        <button
                            key={option.key}
                            type="button"
                            onClick={() => setScope(option.key)}
                            aria-pressed={scope === option.key}
                            className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${
                                scope === option.key
                                    ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-5">
                {VIEWS.filter(supported).map((option) => (
                    <button
                        key={option.key}
                        type="button"
                        onClick={() => setView(option.key)}
                        aria-pressed={resolvedView === option.key}
                        className={`px-2 py-0.5 text-[11px] rounded-full border transition-colors ${
                            resolvedView === option.key
                                ? 'border-gray-800 dark:border-gray-200 text-gray-800 dark:text-gray-100'
                                : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {rows.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">
                    No tasks in this range yet.
                </p>
            ) : (
                <>
                    {resolvedView === 'bubble' && <BubbleView rows={rows} />}
                    {resolvedView === 'treemap' && <TreemapView rows={rows} />}
                    {resolvedView === 'donut' && <DonutView rows={rows} total={active.total} />}
                    {resolvedView === 'bar' && <BarView rows={rows} />}
                    {resolvedView === 'radar' && <RadarView rows={rows} />}

                    {needsLegend && (
                        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4">
                            {rows.map((row) => (
                                <li key={row.id ?? 'none'} className="flex items-center gap-1.5 min-w-0">
                                    <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: row.color }}
                                    />
                                    <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                        {row.name}
                                    </span>
                                    <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                                        {row.total}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                        {active.total} tasks across {rows.length} project{rows.length === 1 ? '' : 's'}
                        {emptyProjects > 0 && ` · ${emptyProjects} with no tasks`}
                    </p>
                </>
            )}
        </motion.div>
    );
}
