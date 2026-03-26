import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BoardTask } from '@/Pages/Periods/types/period';

interface ProjectFilterProps {
    tasks: BoardTask[];
    colorMap: Map<string, string>;
    activeFilter: string | null;
    onFilterChange: (projectId: string | null) => void;
}

export default function ProjectFilter({ tasks, colorMap, activeFilter, onFilterChange }: ProjectFilterProps) {
    const projects = useMemo(() => {
        const seen = new Map<string, { id: string; name: string; color: string; count: number }>();
        tasks.forEach(t => {
            const key = t.project_id || '__no_project__';
            if (!seen.has(key)) {
                seen.set(key, { id: key, name: t.project_name ?? 'No Project', color: colorMap.get(key) ?? '#94a3b8', count: 0 });
            }
            seen.get(key)!.count++;
        });
        return Array.from(seen.values());
    }, [tasks, colorMap]);

    if (projects.length === 0) return null;

    return (
        <div className="flex items-center gap-2 flex-wrap px-1">
            <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mr-1">
                Projects:
            </span>

            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onFilterChange(null)}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-all duration-150 shadow-sm
                    ${activeFilter === null
                        ? 'bg-gray-800 dark:bg-slate-600 text-white border-gray-800 dark:border-slate-500'
                        : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-slate-700 hover:border-gray-300'
                    }`}
            >
                All
            </motion.button>

            {projects.map(p => {
                const isActive = activeFilter === p.id;
                return (
                    <motion.button
                        key={p.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onFilterChange(isActive ? null : p.id)}
                        className={`flex items-center gap-1.5 rounded-full pl-1.5 pr-3 py-1 text-xs font-medium border transition-all duration-150 shadow-sm
                            ${isActive
                                ? 'text-white border-transparent'
                                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-slate-700 hover:border-gray-300 opacity-70 hover:opacity-100'
                            }`}
                        style={isActive ? { backgroundColor: p.color, borderColor: p.color } : {}}
                    >
                        <span
                            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.7)' : p.color }}
                        />
                        {p.name}
                        <span className={`ml-0.5 font-bold tabular-nums ${isActive ? 'text-white/80' : 'text-gray-400 dark:text-slate-500'}`}>
                            {p.count}
                        </span>
                    </motion.button>
                );
            })}

            {activeFilter !== null && (
                <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs text-gray-400 dark:text-slate-500"
                >
                    — filtered
                </motion.span>
            )}
        </div>
    );
}
