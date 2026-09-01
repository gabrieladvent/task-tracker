import { Head } from '@inertiajs/react';
import { CalendarX2, Download } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ActivityDigest, ActivityFilters, DigestProject } from '@/Pages/Activity/types/activity';
import DigestFilters from './Components/DigestFilters';
import DigestSummaryCards from './Components/DigestSummaryCards';
import DigestDayCard from './Components/DigestDayCard';

interface Props {
    digest: ActivityDigest;
    projects: DigestProject[];
    filters: ActivityFilters;
}

export default function ActivityIndex({ digest, projects, filters }: Props) {
    // Mirror whichever filter the page is actually on, so the spreadsheet
    // matches what is on screen rather than the default range.
    const exportParams = {
        ...(filters.preset === 'custom'
            ? { from: filters.from, to: filters.to }
            : { preset: filters.preset }),
        ...(filters.project_id ? { project_id: filters.project_id } : {}),
    };

    return (
        <AuthenticatedLayout>
            <Head title="Activity" />

            <div className="py-10 w-full">
                <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Activity</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                What you worked on, day by day — grouped per task so a carry-over reads as
                                one story instead of a new task every morning.
                            </p>
                        </div>

                        {digest.days.length > 0 && (
                            <a
                                href={route('activity.export', exportParams)}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <Download size={15} aria-hidden="true" />
                                Export
                            </a>
                        )}
                    </div>

                    <DigestFilters filters={filters} projects={projects} />

                    <DigestSummaryCards totals={digest.totals} />

                    {digest.days.length > 0 ? (
                        <div className="space-y-4">
                            {digest.days.map(day => (
                                <DigestDayCard key={day.date} day={day} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-16 text-center">
                            <CalendarX2 className="mx-auto mb-3 text-gray-400" size={32} aria-hidden="true" />
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                                Nothing recorded in this range
                            </h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Try a wider date range, or clear the project filter.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
