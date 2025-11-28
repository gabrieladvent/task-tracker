import { Link } from '@inertiajs/react';
import { WelcomeMessageProps } from '@/Pages/Home/types/dashboard';


export default function WelcomeMessage({
    title,
    description,
    ctaText,
    ctaHref,
}: WelcomeMessageProps) {
    return (
        <div className="mt-6 overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    {title}
                </h3>
                <p className="mt-2 text-gray-600">
                    {description}
                </p>
                <div className="mt-4">
                    <Link
                        href={ctaHref}
                        className="inline-flex items-center rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-all duration-300 ease-in-out hover:bg-gray-700 hover:scale-105 hover:shadow-lg"
                    >
                        {ctaText}
                        <svg
                            className="ml-2 h-4 w-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}
