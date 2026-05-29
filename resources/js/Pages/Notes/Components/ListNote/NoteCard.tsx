// resources/js/Pages/Notes/Components/ListNote/NoteCard.tsx

import { motion } from 'framer-motion';
import { router } from '@inertiajs/react';
import { Pin, Archive, Trash2, PinOff } from 'lucide-react';
import { Note } from '../../types/note';

interface Props {
    note: Note;
    index: number;
    onEdit: (note: Note) => void;
}

export default function NoteCard({ note, index, onEdit }: Props) {
    const handlePin = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.patch(route('notes.pin', note.id));
    };

    const handleArchive = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.patch(route('notes.archive', note.id));
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Hapus note ini?')) {
            router.delete(route('notes.destroy', note.id));
        }
    };

    const formattedDate = new Date(note.updated_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            onClick={() => onEdit(note)}
            className="group relative flex flex-col gap-3 rounded-2xl border border-black/[0.06] p-4 cursor-pointer
                       shadow-sm hover:shadow-md transition-shadow duration-200"
            style={{ backgroundColor: note.color }}
        >
            {/* Pin badge */}
            {note.is_pinned && (
                <span className="absolute -top-2 -right-2 text-base">📌</span>
            )}

            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 flex-1">
                    {note.title}
                </h3>

                {/* Actions — visible on hover */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                    <ActionIcon
                        onClick={handlePin}
                        title={note.is_pinned ? 'Lepas sematan' : 'Sematkan'}
                    >
                        {note.is_pinned ? (
                            <PinOff className="size-3.5" />
                        ) : (
                            <Pin className="size-3.5" />
                        )}
                    </ActionIcon>
                    <ActionIcon onClick={handleArchive} title="Arsipkan">
                        <Archive className="size-3.5" />
                    </ActionIcon>
                    <ActionIcon onClick={handleDelete} title="Hapus" danger>
                        <Trash2 className="size-3.5" />
                    </ActionIcon>
                </div>
            </div>

            {/* Content preview */}
            {note.content && (
                <p className="text-xs text-gray-600 line-clamp-4 leading-relaxed">
                    {note.content}
                </p>
            )}

            {/* Tags */}
            {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-auto">
                    {note.tags.map((tag) => (
                        <span
                            key={tag.id}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white tracking-wide"
                            style={{ backgroundColor: tag.color }}
                        >
                            {tag.name}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <p className="text-[10px] text-gray-400">{formattedDate}</p>
        </motion.div>
    );
}

function ActionIcon({
    onClick,
    title,
    children,
    danger,
}: {
    onClick: (e: React.MouseEvent) => void;
    title: string;
    children: React.ReactNode;
    danger?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-1.5 rounded-lg transition-colors duration-150 ${danger
                    ? 'hover:bg-red-100 hover:text-red-600 text-gray-400'
                    : 'hover:bg-black/10 text-gray-500'
                }`}
        >
            {children}
        </button>
    );
}
