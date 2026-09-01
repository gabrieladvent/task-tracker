import { Head } from '@inertiajs/react';
import { CalendarX2 } from 'lucide-react';
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
    return (
        <AuthenticatedLayout>
            <Head title="Activity" />

            <div className="py-10 w-full">
                <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Activity</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            What you worked on, day by day — grouped per task so a carry-over reads as
                            one story instead of a new task every morning.
                        </p>
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
