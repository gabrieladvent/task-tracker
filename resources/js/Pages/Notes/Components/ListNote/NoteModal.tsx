// resources/js/Pages/Notes/Components/ListNote/NoteModal.tsx

import { FormEvent, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import ColorPicker from './ColorPicker';
import TagSelector from './TagSelector';
import { Note, NoteFormData, NoteTag } from '../../types/note';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    tags: NoteTag[];
    editingNote?: Note | null; // null = create mode
}

export default function NoteModal({ isOpen, onClose, tags, editingNote }: Props) {
    const isEditing = !!editingNote;

    const { data, setData, post, patch, reset, processing, errors } =
        useForm<NoteFormData>({
            title: '',
            content: '',
            color: '#ffffff',
            tag_ids: [],
        });

    // Sync form ketika editingNote berubah
    useEffect(() => {
        if (editingNote) {
            setData({
                title: editingNote.title,
                content: editingNote.content ?? '',
                color: editingNote.color,
                tag_ids: editingNote.tags.map((t) => t.id),
            });
        } else {
            reset();
        }
    }, [editingNote]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            patch(route('notes.update', editingNote!.id), {
                onSuccess: handleClose,
            });
        } else {
            post(route('notes.store'), {
                onSuccess: handleClose,
            });
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        // stop click-through to backdrop
                        onClick={(e) => e.stopPropagation()}
                    >
                        <form
                            onSubmit={handleSubmit}
                            className="w-full max-w-lg rounded-2xl shadow-2xl p-6 flex flex-col gap-4"
                            style={{ backgroundColor: data.color }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-semibold text-gray-800">
                                    {isEditing ? 'Edit Note' : 'Buat Note Baru'}
                                </h2>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-black/10 hover:text-gray-600 transition-colors"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>

                            {/* Title */}
                            <div>
                                <input
                                    type="text"
                                    placeholder="Judul catatan..."
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                    className="w-full bg-white/60 border border-black/10 rounded-lg px-3 py-2 text-sm
                                               placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400
                                               dark:placeholder-gray-500"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-xs text-red-500">{errors.title}</p>
                                )}
                            </div>

                            {/* Content */}
                            <textarea
                                placeholder="Isi catatan..."
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                rows={6}
                                className="w-full bg-white/60 border border-black/10 rounded-lg px-3 py-2 text-sm
                                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400
                                           resize-none leading-relaxed"
                            />

                            {/* Color Picker */}
                            <ColorPicker
                                value={data.color}
                                onChange={(c) => setData('color', c)}
                            />

                            {/* Tags */}
                            <TagSelector
                                tags={tags}
                                selectedIds={data.tag_ids}
                                onChange={(ids) => setData('tag_ids', ids)}
                            />

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    Batal
                                </button>
                                <motion.button
                                    type="submit"
                                    disabled={processing}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="rounded-md bg-gray-800 dark:bg-gray-100 dark:text-gray-800 px-4 py-2
                                               text-sm font-medium text-white hover:bg-gray-700 transition-colors
                                               disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing
                                        ? 'Menyimpan...'
                                        : isEditing
                                            ? 'Simpan Perubahan'
                                            : 'Simpan'}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
