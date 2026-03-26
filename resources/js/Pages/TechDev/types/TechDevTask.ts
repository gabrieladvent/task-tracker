export interface TechDevTask {
    id: string;
    project_id: string | null;
    title: string;
    description: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    project?: {
        id: string;
        name: string;
        color: string | null;
    };
}
