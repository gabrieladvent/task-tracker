import { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import { TrashItem, TrashType } from '@/Pages/Trash/types/trash';
import TrashList from './Components/TrashList';

interface Props {
    tasks: TrashItem[];
    projects: TrashItem[];
    periods: TrashItem[];
}

const TABS: { type: TrashType; label: string }[] = [
    { type: 'tasks', label: 'Tasks' },
    { type: 'projects', label: 'Projects' },
    { type: 'periods', label: 'Periods' },
];

const SINGULAR: Record<TrashType, string> = {
    tasks: 'task',
    projects: 'project',
    periods: 'period',
};

export default function TrashIndex({ tasks, projects, periods }: Props) {
    const items: Record<TrashType, TrashItem[]> = { tasks, projects, periods };

    const [activeTab, setActiveTab] = useState<TrashType>('tasks');
    const [pendingDelete, setPendingDelete] = useState<{ type: TrashType; item: TrashItem } | null>(null);

    const handleRestore = (type: TrashType, item: TrashItem) => {
        router.patch(route('trash.restore', [type, item.id]), {}, { preserveScroll: true });
    };

    const confirmMessage = useMemo(() => {
        if (!pendingDelete) return '';

        const { type, item } = pendingDelete;
        const base = `This permanently deletes the ${SINGULAR[type]} "${item.title}".`;

        if (item.cascade.length === 0) {
            return `${base} It cannot be undone.`;
        }

        // The cascade still reaches rows that are not in the trash, which is
        // the one thing someone clicking this button cannot see for themselves.
        return `${base} It will also delete ${item.cascade.join(' and ')}, including any that are not in the trash. It cannot be undone.`;
    }, [pendingDelete]);

    return (
        <AuthenticatedLayout>
            <Head title="Trash" />

            <div className="py-10 w-full">
                <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Trash</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Deleted tasks, projects and periods are kept here. Restoring one puts it
                            straight back; deleting it forever is the only action that still cascades.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {TABS.map(tab => (
                            <button
                                key={tab.type}
                                type="button"
                                onClick={() => setActiveTab(tab.type)}
                                aria-pressed={activeTab === tab.type}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                    activeTab === tab.type
                                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {tab.label}
                                <span className="ml-1.5 opacity-70">{items[tab.type].length}</span>
                            </button>
                        ))}
                    </div>

                    <TrashList
                        type={activeTab}
                        items={items[activeTab]}
                        onRestore={handleRestore}
                        onForceDelete={(type, item) => setPendingDelete({ type, item })}
                    />
                </div>
            </div>

            <ConfirmDeleteModal
                isOpen={pendingDelete !== null}
                onClose={() => setPendingDelete(null)}
                onConfirm={() => {
                    if (!pendingDelete) return;

                    router.delete(
                        route('trash.force-destroy', [pendingDelete.type, pendingDelete.item.id]),
                        { preserveScroll: true }
                    );
                }}
                title="Delete forever"
                message={confirmMessage}
            />
        </AuthenticatedLayout>
    );
}
