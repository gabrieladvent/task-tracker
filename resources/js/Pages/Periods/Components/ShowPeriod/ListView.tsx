import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { TasksByDate, CalendarTask } from '@/Pages/Periods/types/period';
import { getStatusColor, getPriorityColor, getStatusLabel } from '@/Pages/Periods/utils';

interface ListViewProps {
    tasksByDate: TasksByDate[];
    onAddTask: (date: string) => void;
    onTaskClick: (task: CalendarTask) => void;
}

function ActivityBadge({ task }: { task: CalendarTask }) {
    if (task.is_status_changed_today) return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
            <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Updated
        </span>
    );
    if (task.is_new_today) return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            New
        </span>
    );
    if (task.is_carry_over) return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
            <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Carry-over
        </span>
    );
    return null;
}

function getTaskRowStyle(task: CalendarTask): string {
    const base = 'flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 dark:border-slate-700/50 last:border-none cursor-pointer transition-colors border-l-2';
    if (task.is_status_changed_today) return `${base} border-l-blue-400 bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70 dark:hover:bg-blue-950/30`;
    if (task.is_new_today) return `${base} border-l-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30`;
    if (task.is_carry_over) return `${base} border-l-amber-400 bg-amber-50/30 dark:bg-amber-950/20 hover:bg-amber-50/60 dark:hover:bg-amber-950/30`;
    return `${base} border-l-transparent hover:bg-gray-50 dark:hover:bg-slate-700/40`;
}

function getProgressColor(pct: number): string {
    if (pct >= 100) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-amber-400';
    return 'bg-red-400';
}

export default function ListView({ tasksByDate, onAddTask, onTaskClick }: ListViewProps) {
    const today = useMemo(() => new Date().toISOString().split('T')[0], []);
    const [showTodayChangesOnly, setShowTodayChangesOnly] = useState(false);

    const [collapsedDates, setCollapsedDates] = useState<Set<string>>(() => {
        const s = new Set<string>();
        tasksByDate.forEach(g => { if (g.date !== today) s.add(g.date); });
        return s;
    });

    const toggle = (date: string) => {
        setCollapsedDates(prev => {
            const next = new Set(prev);
            next.has(date) ? next.delete(date) : next.add(date);
            return next;
        });
    };

    const collapsed = tasksByDate.filter(d => collapsedDates.has(d.date));
    const expanded = tasksByDate.filter(d => !collapsedDates.has(d.date));

    if (tasksByDate.length === 0) return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800/90"
        >
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <svg className="mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm text-gray-400 dark:text-gray-500">No tasks yet. Click + on any date to get started.</p>
            </div>
        </motion.div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">

            {/* ── Collapsed date cards ── */}
            {collapsed.length > 0 && (
                <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                    <AnimatePresence>
                        {collapsed.map((g, i) => {
                            const done = g.tasks.filter((t) => t.status === 'done').length;
                            const total = g.tasks.length;
                            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

                            return (
                                <motion.div
                                    key={g.date}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.02 }}
                                    onClick={() => toggle(g.date)}
                                    className="group rounded-lg border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-3 cursor-pointer hover:border-gray-200 dark:hover:border-slate-600 hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-1">
                                        <div>
                                            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                                {g.day_name}
                                            </p>
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mt-0.5">
                                                {g.formatted_date}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onAddTask(g.date); }}
                                            className="opacity-0 group-hover:opacity-100 flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 dark:border-slate-600 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
                                        >
                                            <Plus size={10} />
                                        </button>
                                    </div>

                                    {/* Mini progress bar */}
                                    <div className="mt-2 h-1 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${getProgressColor(pct)}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                                        {done}/{total} done
                                    </p>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* ── Expanded date groups ── */}
            <AnimatePresence>
                {expanded.map((g, i) => {
                    const isToday = g.date === today;

                    return (
                        <motion.div
                            key={g.date}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: i * 0.04 }}
                            className="overflow-hidden rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800/90"
                        >
                            {/* Header */}
                            <div
                                onClick={() => toggle(g.date)}
                                className="flex items-center justify-between px-5 py-4 bg-gray-50/70 dark:bg-slate-900/40 border-b border-gray-100 dark:border-slate-700 cursor-pointer hover:bg-gray-100/60 dark:hover:bg-slate-900/60 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <ChevronDown size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                        {g.day_name}, {g.formatted_date}
                                    </span>
                                    {isToday && (
                                        <span className="rounded-full bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                                            Today
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        {g.tasks.length} tasks
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isToday && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowTodayChangesOnly(prev => !prev); }}
                                            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${showTodayChangesOnly
                                                ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-gray-200'
                                                }`}
                                        >
                                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            {showTodayChangesOnly ? 'All tasks' : "Today's changes"}
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onAddTask(g.date); }}
                                        className="flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                    >
                                        <Plus size={13} />
                                        Add task
                                    </button>
                                </div>
                            </div>

                            {/* Task rows */}
                            <div>
                                {(isToday && showTodayChangesOnly
                                    ? g.tasks.filter((t) => !t.is_carry_over || t.is_status_changed_today || t.is_new_today)
                                    : g.tasks
                                ).map((task, ti) => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: ti * 0.03 }}
                                        className={getTaskRowStyle(task)}
                                        onClick={() => onTaskClick(task)}
                                    >
                                        {/* Status dot */}
                                        <span className={`h-3 w-3 rounded-full shrink-0 ${getStatusColor(task.status)}`} />

                                        {/* Title + project */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-base font-medium truncate ${task.status === 'done' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>
                                                {task.title}
                                            </p>
                                            {task.project && (
                                                <p className="text-sm text-gray-400 dark:text-gray-500 truncate mt-0.5">
                                                    {task.project}
                                                </p>
                                            )}
                                        </div>

                                        {/* Right side meta */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <ActivityBadge task={task} />
                                            {task.story_points != null && (
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    {task.story_points} pts
                                                </span>
                                            )}
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                            <span className="rounded-full border border-gray-100 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 px-3 py-1 text-xs text-gray-500 dark:text-gray-400">
                                                {getStatusLabel(task.status)}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </motion.div>
    );
}
