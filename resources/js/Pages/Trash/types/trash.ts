export type TrashType = "tasks" | "projects" | "periods";

export interface TrashItem {
    id: string;
    title: string;
    subtitle: string | null;
    meta: string[];
    color?: string | null;
    deleted_at: string | null;
    /** What a permanent delete would take along, e.g. ["84 tasks", "2 reports"]. */
    cascade: string[];
}
