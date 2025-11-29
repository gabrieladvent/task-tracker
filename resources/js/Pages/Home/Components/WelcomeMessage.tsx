import { Link } from '@inertiajs/react';
import { WelcomeMessageProps } from '@/Pages/Home/types/dashboard';
import { useState } from 'react';

export default function WelcomeMessage({
    title,
    description,
    ctaText,
    ctaHref,
}: WelcomeMessageProps) {
    const [copied, setCopied] = useState(false);
    const command = 'php artisan task:copy-incomplete --date= --from-date=';

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(command);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="mt-6 overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    {title}
                </h3>

                <p className="mt-2 text-gray-600">
                    {description}
                </p>

                <div className="mt-3 rounded-md bg-gray-50 p-3">
                    <p className="mb-2 text-sm text-gray-700">
                        Don't forget to run this command to copy incomplete tasks from your previous day:
                    </p>
                    <div className="flex items-center justify-between rounded border border-gray-300 bg-white p-2">
                        <code className="text-sm text-gray-800">
                            {command}
                        </code>
                        <button
                            onClick={copyToClipboard}
                            className="ml-3 flex items-center gap-1 rounded bg-gray-800 px-3 py-1 text-xs text-white transition-colors hover:bg-gray-700"
                            title="Copy command"
                        >
                            {copied ? (
                                <>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copy
                                </>
                            )}
                        </button>
                    </div>
                </div>

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
