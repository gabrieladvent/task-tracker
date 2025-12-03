import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
}

export default function Pagination({ links }: PaginationProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-1"
        >
            {links.map((link, index) => {
                const isFirst = index === 0;
                const isLast = index === links.length - 1;

                // Parse label for previous/next
                let displayLabel = link.label;
                if (isFirst) displayLabel = '←';
                if (isLast) displayLabel = '→';

                return (
                    <div key={index}>
                        {link.url ? (
                            <Link
                                href={link.url}
                                className={`
                                    px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                    ${link.active
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                    }
                                `}
                                preserveScroll
                                preserveState
                            >
                                <span dangerouslySetInnerHTML={{ __html: displayLabel }} />
                            </Link>
                        ) : (
                            <span
                                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-400 bg-gray-100 cursor-not-allowed"
                            >
                                <span dangerouslySetInnerHTML={{ __html: displayLabel }} />
                            </span>
                        )}
                    </div>
                );
            })}
        </motion.div>
    );
}
