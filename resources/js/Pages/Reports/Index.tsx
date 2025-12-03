import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Report } from './types/report';
import Pagination from '@/Components/Pagination';
import ReportHeader from './Components/ReportHeader';
import ReportFilters from './Components/ReportFilters';
import ReportGrid from './Components/ReportGrid';
import ReportEmptyState from './Components/ReportEmptyState';
import ReportInfo from './Components/ReportInfo';

interface Props {
    period: {
        id: string;
        name: string;
        start_date: string;
        end_date: string;
    };
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

export default function ReportsIndex({ period, reports, filters }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title={`Reports - ${period.name}`} />

            <div className="py-10 w-full">
                <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
                    <ReportHeader
                        title={`Reports for ${period.name}`}
                        subtitle={`${period.start_date} - ${period.end_date}`}
                        backLink={{
                            href: `/periods/${period.id}`,
                            label: 'Back to Period'
                        }}
                    />

                    <div className="mb-6">
                        <ReportFilters
                            initialSearch={filters.search}
                            currentPerPage={filters.per_page}
                            searchPlaceholder="Search reports..."
                        />
                    </div>

                    {reports.data.length > 0 ? (
                        <>
                            <ReportGrid
                                reports={reports.data}
                                periodId={period.id}
                            />
                            <Pagination links={reports.links} />
                            <ReportInfo
                                currentCount={reports.data.length}
                                totalCount={reports.total}
                            />
                        </>
                    ) : (
                        <ReportEmptyState
                            hasSearch={!!filters.search}
                            periodId={period.id}
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
