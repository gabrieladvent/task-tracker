import { Link } from '@inertiajs/react';
import { Pin } from 'lucide-react';
import { ReminderNote } from '@/types';

interface Props {
    notes: ReminderNote[];
    /** Called when an item is clicked (e.g. to close a popover). */
    onItemClick?: () => void;
}

/**
 * Presentational list of pinned notes used as reminders.
 * Shared between the Dashboard card and the global floating widget.
 */
export default function ReminderList({ notes, onItemClick }: Props) {
    if (notes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                <Pin size={20} strokeWidth={1.5} className="text-gray-300 dark:text-gray-600" />
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    Belum ada pengingat.
                </p>
                <Link
                    href={route('notes.index')}
                    onClick={onItemClick}
                    className="text-xs font-medium text-gray-600 dark:text-gray-300 underline underline-offset-2 hover:text-gray-900 dark:hover:text-gray-100"
                >
                    Sematkan note untuk dijadikan pengingat
                </Link>
            </div>
        );
    }

    return (
        <ul className="flex flex-col gap-2">
            {notes.map((note) => (
                <li key={note.id}>
                    <Link
                        href={route('notes.index')}
                        onClick={onItemClick}
                        className="group flex gap-2.5 rounded-lg border border-black/[0.06] dark:border-white/[0.06] p-2.5 transition-shadow hover:shadow-sm"
                        style={{ backgroundColor: note.color }}
                    >
                        <span className="mt-0.5 shrink-0 text-xs">📌</span>
                        <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-gray-800">
                                {note.title}
                            </p>
                            {note.content && (
                                <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-gray-600">
                                    {note.content}
                                </p>
                            )}
                        </div>
                    </Link>
                </li>
            ))}
        </ul>
    );
}
