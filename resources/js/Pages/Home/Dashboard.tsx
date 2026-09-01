import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { PastPeriod, PeriodStats, ProjectDistribution as Distribution, StuckTasks as StuckTasksData, TodayTask } from './types/dashboard';
import { DashboardHeader } from './Components/DashboardHeader';
import { CurrentPeriodCard } from './Components/CurrentPeriodCard';
import { TodayTaskList } from './Components/TodayTaskList';
import { StuckTasks } from './Components/StuckTasks';
import { CompletionTrend } from './Components/CompletionTrend';
import { ProjectDistribution } from './Components/Distribution';
import { QuickLinks } from './Components/QuickLinks';
import { CopyCommandCard } from './Components/CopyCommandCard';
import { NotesReminder } from './Components/NotesReminder';

interface Props {
    currentPeriod: PeriodStats | null;
    todayTasks: TodayTask[];
    pastPeriods: PastPeriod[];
    projectDistribution: Distribution;
    stuckTasks: StuckTasksData;
    todayStr: string;
}

function fadeUp(delay = 0) {
    return {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { delay, duration: 0.3 },
    };
}

export default function Dashboard({ currentPeriod, todayTasks, pastPeriods, projectDistribution, stuckTasks, todayStr }: Props) {
    const today = new Date(todayStr);
    const dayName = today.toLocaleString('default', { weekday: 'long' });
    const dateLabel = today.toLocaleString('default', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <AuthenticatedLayout>
            
            <Head title="Dashboard" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-full">

                <DashboardHeader dayName={dayName} dateLabel={dateLabel} fadeUp={fadeUp} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Left column (2/3) ── */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <CurrentPeriodCard currentPeriod={currentPeriod} fadeUp={fadeUp} />
                        <TodayTaskList currentPeriod={currentPeriod} todayTasks={todayTasks} fadeUp={fadeUp} />
                        <StuckTasks stuckTasks={stuckTasks} fadeUp={fadeUp} />
                    </div>

                    {/* ── Right column (1/3) ── */}
                    <div className="flex flex-col gap-6">
                        <ProjectDistribution distribution={projectDistribution} fadeUp={fadeUp} />
                        <CompletionTrend pastPeriods={pastPeriods} fadeUp={fadeUp} />
                        <NotesReminder fadeUp={fadeUp} />
                        {/* <QuickLinks fadeUp={fadeUp} /> */}
                        <CopyCommandCard fadeUp={fadeUp} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
