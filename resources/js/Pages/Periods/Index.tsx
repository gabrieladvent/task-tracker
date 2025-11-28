import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
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

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsModalOpen(true)}
                        className="rounded-md mb-5 bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors justify-end"
                    >
                        New Period
                    </motion.button>

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
