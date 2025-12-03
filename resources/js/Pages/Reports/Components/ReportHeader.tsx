import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

interface ReportHeaderProps {
    title: string;
    subtitle?: string;
    backLink?: {
        href: string;
        label: string;
    };
}

export default function ReportHeader({ title, subtitle, backLink }: ReportHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                    {subtitle && (
                        <p className="text-sm text-gray-600">{subtitle}</p>
                    )}
                </div>
                {backLink && (
                    <Link
                        href={backLink.href}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        ← {backLink.label}
                    </Link>
                )}
            </div>
        </motion.div>
    );
}
