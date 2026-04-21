import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Archive, Trash2 } from 'lucide-react';
import SearchBar from './Components/ListNote/SearchBar';
import NoteCard from './Components/ListNote/NoteCard';
import EmptyState from '@/Pages/Periods/Components/ListPeriod/EmptyState';
import NoteModal from './Components/ListNote/NoteModal';
import { Note, NoteFilters, NoteTag } from './types/note';


interface Props {
    notes: Note[];
    tags: NoteTag[];
    filters: NoteFilters;
}

export default function Index({ notes, tags, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);

    const openCreate = () => {
        setEditingNote(null);
        setIsModalOpen(true);
    };

    const openEdit = (note: Note) => {
        setEditingNote(note);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setEditingNote(null);
    };

    const pinned = notes.filter((n) => n.is_pinned);
    const others = notes.filter((n) => !n.is_pinned);

    return (
        <AuthenticatedLayout>
            <Head title="Notes" />

            <div className="py-10 w-full">
                <div className="mx-auto max-w-full sm:px-6 lg:px-8">

                    {/* Toolbar */}
                    <div className="flex items-center gap-3 mb-6 flex-wrap">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={openCreate}
                            className="rounded-md bg-gray-800 dark:bg-gray-100 dark:text-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                        >
                            + Buat Note
                        </motion.button>

                        <SearchBar value={filters.search} />

                        <div className="flex gap-2 ml-auto">
                            <Link
                                href={route('notes.archived')}
                                className="flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-gray-700
                                           px-3 py-2 text-sm text-gray-500 dark:text-gray-400
                                           hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Archive className="size-4" />
                                Arsip
                            </Link>
                            <Link
                                href={route('notes.trash')}
                                className="flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-gray-700
                                           px-3 py-2 text-sm text-gray-500 dark:text-gray-400
                                           hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Trash2 className="size-4" />
                                Sampah
                            </Link>
                        </div>
                    </div>

                    {notes.length > 0 ? (
                        <div className="space-y-6">
                            {/* Pinned section */}
                            {pinned.length > 0 && (
                                <section>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                                        📌 Disematkan
                                    </p>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {pinned.map((note, i) => (
                                            <NoteCard
                                                key={note.id}
                                                note={note}
                                                index={i}
                                                onEdit={openEdit}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Other notes */}
                            {others.length > 0 && (
                                <section>
                                    {pinned.length > 0 && (
                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                                            Lainnya
                                        </p>
                                    )}
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {others.map((note, i) => (
                                            <NoteCard
                                                key={note.id}
                                                note={note}
                                                index={pinned.length + i}
                                                onEdit={openEdit}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    ) : (
                        <EmptyState onCreateClick={openCreate} />
                    )}
                </div>
            </div>

            <NoteModal
                isOpen={isModalOpen}
                onClose={handleClose}
                tags={tags}
                editingNote={editingNote}
            />
        </AuthenticatedLayout>
    );
}
