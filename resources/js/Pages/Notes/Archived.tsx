// resources/js/Pages/Notes/Archived.tsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArchiveRestore } from 'lucide-react';
import { Note } from './types/note';

interface Props {
    notes: Note[];
}

export default function Archived({ notes }: Props) {
    const handleUnarchive = (note: Note) => {
        router.patch(route('notes.unarchive', note.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Arsip Notes" />

            <div className="py-10 w-full">
                <div className="mx-auto max-w-full sm:px-6 lg:px-8">

                    <div className="flex items-center gap-3 mb-6">
                        <Link
                            href={route('notes.index')}
                            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                            <ArrowLeft className="size-4" />
                            Kembali
                        </Link>
                        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            Arsip
                        </h1>
                    </div>

                    {notes.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {notes.map((note, i) => (
                                <motion.div
                                    key={note.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group relative flex flex-col gap-3 rounded-2xl border border-black/[0.06] p-4 shadow-sm"
                                    style={{ backgroundColor: note.color }}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1">
                                            {note.title}
                                        </h3>
                                        <button
                                            type="button"
                                            title="Pulihkan"
                                            onClick={() => handleUnarchive(note)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-black/10 text-gray-500"
                                        >
                                            <ArchiveRestore className="size-4" />
                                        </button>
                                    </div>
                                    {note.content && (
                                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                                            {note.content}
                                        </p>
                                    )}
                                    {note.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-auto">
                                            {note.tags.map((tag) => (
                                                <span
                                                    key={tag.id}
                                                    className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
                                                    style={{ backgroundColor: tag.color }}
                                                >
                                                    {tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-28 text-center text-gray-400">
                            <p className="text-4xl mb-4">📦</p>
                            <p className="text-base font-medium">Arsip kosong</p>
                            <p className="text-sm mt-1">Note yang diarsipkan akan muncul di sini</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
