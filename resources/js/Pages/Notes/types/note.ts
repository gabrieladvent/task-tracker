export interface NoteTag {
    id: number;
    name: string;
    color: string;
}

export interface Note {
    id: number;
    user_id: number;
    title: string;
    content: string | null;
    color: string;
    is_pinned: boolean;
    is_archived: boolean;
    tags: NoteTag[];
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface NoteFilters {
    search?: string;
    tag?: string;
}

export interface NoteFormData {
    title: string;
    content: string;
    color: string;
    tag_ids: number[];
}

export const NOTE_COLORS: { hex: string; label: string }[] = [
    { hex: "#ffffff", label: "White" },
    { hex: "#fef9c3", label: "Yellow" },
    { hex: "#dcfce7", label: "Green" },
    { hex: "#dbeafe", label: "Blue" },
    { hex: "#fce7f3", label: "Pink" },
    { hex: "#ede9fe", label: "Purple" },
    { hex: "#ffedd5", label: "Orange" },
    { hex: "#f1f5f9", label: "Slate" },
];
