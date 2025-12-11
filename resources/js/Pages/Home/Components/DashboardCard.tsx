import { Link } from '@inertiajs/react';
import { DashboardCardProps } from '@/Pages/Home/types/dashboard';

export default function DashboardCard({
    title,
    description,
    icon,
    href,
    isComingSoon = false,
}: DashboardCardProps) {
    const cardContent = (
        <div className="p-6 dark:bg-gray-800">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-100">
                        {description}
                    </p>
                </div>
                {icon}
            </div>
        </div>
    );

    const baseClassName = `overflow-hidden bg-white shadow-sm sm:rounded-lg ${isComingSoon ? 'opacity-50' : ''
        }`;

    if (href && !isComingSoon) {
        return (
            <Link
                href={href}
                className={`${baseClassName} block transition hover:shadow-md`}
            >
                {cardContent}
            </Link>
        );
    }

    return <div className={baseClassName}>{cardContent}</div>;
}
