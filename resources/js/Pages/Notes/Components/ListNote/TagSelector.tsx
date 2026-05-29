// resources/js/Pages/Notes/Components/ListNote/TagSelector.tsx

import { NoteTag } from "../../types/note";

interface Props {
    tags: NoteTag[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
}

export default function TagSelector({ tags, selectedIds, onChange }: Props) {
    if (tags.length === 0) return null;

    const toggle = (id: number) => {
        onChange(
            selectedIds.includes(id)
                ? selectedIds.filter((i) => i !== id)
                : [...selectedIds, id],
        );
    };

    return (
        <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => {
                const selected = selectedIds.includes(tag.id);
                return (
                    <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggle(tag.id)}
                        className="px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150"
                        style={
                            selected
                                ? { backgroundColor: tag.color, borderColor: tag.color, color: '#fff' }
                                : { borderColor: tag.color, color: tag.color }
                        }
                    >
                        {tag.name}
                    </button>
                );
            })}
        </div>
    );
}
