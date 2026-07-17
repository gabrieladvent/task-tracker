export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export type Appearance = "light" | "dark" | "system";

export interface ReminderNote {
    id: string;
    title: string;
    content: string | null;
    color: string;
    updated_at: string;
}

export interface NavBadges {
    periods?: number;
    projects?: number;
    reports?: number;
    techDev?: number;
    notes?: number;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    auth: {
        user: User;
    };
    badges?: NavBadges;
    reminders?: ReminderNote[];
    appearance?: Appearance;
    app?: {
        env: string;
    };
};
