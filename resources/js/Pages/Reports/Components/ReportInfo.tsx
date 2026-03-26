interface ReportInfoProps {
    currentCount: number;
    totalCount: number;
}

export default function ReportInfo({ currentCount, totalCount }: ReportInfoProps) {
    return (
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
            Showing {currentCount} of {totalCount} reports
        </div>
    );
}
