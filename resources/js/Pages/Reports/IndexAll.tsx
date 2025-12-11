import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import ReportHeader from './Components/ReportHeader';
import ReportFilters from './Components/ReportFilters';
import ReportGrid from './Components/ReportGrid';
import ReportEmptyState from './Components/ReportEmptyState';
import ReportInfo from './Components/ReportInfo';

interface Report {
    id: string;
    report_name: string;
    period: {
        id: string;
        name: string;
        start_date: string;
        end_date: string;
    };
    total_tasks: number;
    completed_tasks: number;
    total_story_points: number;
    created_at: string;
}

interface Props {
    reports: {
        data: Report[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search: string;
        per_page: number;
    };
}

export default function ReportsIndexAll({ reports, filters }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="All Reports" />

            <div className="py-10 w-full">
                <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
                    <ReportHeader title="All Reports" />

                    <div className="mb-6">
                        <ReportFilters
                            initialSearch={filters.search ?? ''}
                            currentPerPage={filters.per_page}
                            searchPlaceholder="Search reports or periods..."
                        />
                    </div>

                    {reports.data.length > 0 ? (
                        <>
                            <ReportGrid
                                reports={reports.data}
                                periodId=""
                                showPeriodBadge
                            />
                            <Pagination links={reports.links} />
                            <ReportInfo
                                currentCount={reports.data.length}
                                totalCount={reports.total}
                            />
                        </>
                    ) : (
                        <ReportEmptyState hasSearch={!!filters.search} />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
