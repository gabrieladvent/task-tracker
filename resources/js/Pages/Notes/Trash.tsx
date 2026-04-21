// resources/js/Pages/Notes/Trash.tsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react';
import { Note } from './types/note';

interface Props {
    notes: Note[];
}

export default function Trash({ notes }: Props) {
    const handleRestore = (note: Note) => {
        router.patch(route('notes.restore', note.id));
    };

    const handleForceDelete = (note: Note) => {
        if (confirm('Hapus permanen? Tidak bisa dikembalikan.')) {
            router.delete(route('notes.force-destroy', note.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Sampah Notes" />

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
                            Sampah
                        </h1>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                            Note terhapus akan hilang otomatis setelah 30 hari
                        </span>
                    </div>

                    {notes.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {notes.map((note, i) => (
                                <motion.div
                                    key={note.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group relative flex flex-col gap-3 rounded-2xl border border-black/[0.06] p-4 shadow-sm opacity-70 hover:opacity-100 transition-opacity"
                                    style={{ backgroundColor: note.color }}
                                >
                                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
                                        {note.title}
                                    </h3>
                                    {note.content && (
                                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                                            {note.content}
                                        </p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-auto pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            type="button"
                                            onClick={() => handleRestore(note)}
                                            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md px-2 py-1 hover:bg-white/60 transition-colors"
                                        >
                                            <RotateCcw className="size-3" />
                                            Pulihkan
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleForceDelete(note)}
                                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-md px-2 py-1 hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="size-3" />
                                            Hapus Permanen
                                        </button>
                                    </div>

                                    <p className="text-[10px] text-gray-400">
                                        Dihapus:{' '}
                                        {new Date(note.deleted_at!).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-28 text-center text-gray-400">
                            <p className="text-4xl mb-4">🗑️</p>
                            <p className="text-base font-medium">Sampah kosong</p>
                            <p className="text-sm mt-1">Note yang dihapus akan muncul di sini</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
