import SearchBar from '@/Components/SearchBar';
import PerPageSelector from '@/Components/PerPageSelector';

interface ReportFiltersProps {
    initialSearch: string;
    currentPerPage: number;
    searchPlaceholder?: string;
}

export default function ReportFilters({
    initialSearch,
    currentPerPage,
    searchPlaceholder = "Search reports..."
}: ReportFiltersProps) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
                <SearchBar
                    initialSearch={initialSearch}
                    placeholder={searchPlaceholder}
                />
            </div>
            <PerPageSelector currentPerPage={currentPerPage} />
        </div>
    );
}
