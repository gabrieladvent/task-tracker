import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ListChecks } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Period } from '@/Pages/Periods/types/period';
import PeriodCard from '@/Pages/Periods/Components/ListPeriod/PeriodCard';
import CreatePeriodModal from '@/Pages/Periods/Components/ListPeriod/CreatePeriodModal';
import EmptyState from '@/Pages/Periods/Components/ListPeriod/EmptyState';

interface Props {
    periods: Period[];
}

export default function Index({ periods }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <AuthenticatedLayout>
            <Head title="Periods" />

            <div className="py-10 w-full">
                <div className="mx-auto max-w-full sm:px-6 lg:px-8">
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsModalOpen(true)}
                            className="rounded-md bg-gray-800 dark:bg-gray-100 dark:text-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                        >
                            New Period
                        </motion.button>

                        <Link
                            href={route('periods.all-tasks')}
                            className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <ListChecks size={16} aria-hidden="true" />
                            All Tasks
                        </Link>
                    </div>

                    {periods.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {periods.map((period, index) => (
                                <PeriodCard
                                    key={period.id}
                                    period={period}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState onCreateClick={() => setIsModalOpen(true)} />
                    )}
                </div>
            </div>

            <CreatePeriodModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </AuthenticatedLayout>
    );
}
