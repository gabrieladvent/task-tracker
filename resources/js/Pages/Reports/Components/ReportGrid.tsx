import ReportCard from './ReportCard';

interface ReportGridProps {
    reports: any[];
    periodId: string;
    showPeriodBadge?: boolean;
}

export default function ReportGrid({ reports, periodId, showPeriodBadge = false }: ReportGridProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            {reports.map((report, index) => (
                <ReportCard
                    key={report.id}
                    report={report}
                    periodId={showPeriodBadge ? report.period.id : periodId}
                    index={index}
                    showPeriodBadge={showPeriodBadge}
                />
            ))}
        </div>
    );
}
