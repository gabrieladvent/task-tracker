import { STATUS_OPTIONS } from "@/Pages/Periods/Constants/StatusOption";

export const PROJECT_COLORS = [
    "#6366f1",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#f97316",
    "#ec4899",
    "#14b8a6",
    "#84cc16",
];

const STATUS_VISUAL: Record<
    string,
    { icon: string; accent: string; ring: string }
> = {
    todo: {
        icon: "○",
        accent: "#94a3b8",
        ring: "ring-slate-300 dark:ring-slate-600",
    },
    in_progress: {
        icon: "◑",
        accent: "#3b82f6",
        ring: "ring-blue-300 dark:ring-blue-700",
    },
    code_review: {
        icon: "◈",
        accent: "#a855f7",
        ring: "ring-purple-300 dark:ring-purple-700",
    },
    ready_qa: {
        icon: "◎",
        accent: "#8b5cf6",
        ring: "ring-violet-300 dark:ring-violet-700",
    },
    ready_dev: {
        icon: "◇",
        accent: "#7c3aed",
        ring: "ring-violet-400 dark:ring-violet-600",
    },
    on_hold: {
        icon: "⊘",
        accent: "#f59e0b",
        ring: "ring-amber-300 dark:ring-amber-700",
    },
    done: {
        icon: "●",
        accent: "#10b981",
        ring: "ring-emerald-300 dark:ring-emerald-700",
    },
    cancelled: {
        icon: "✕",
        accent: "#ef4444",
        ring: "ring-red-300 dark:ring-red-700",
    },
};

export const STATUS_CONFIG = Object.fromEntries(
    STATUS_OPTIONS.map((opt) => [
        opt.value,
        {
            label: opt.label,
            ...(STATUS_VISUAL[opt.value] ?? {
                icon: "○",
                accent: "#94a3b8",
                ring: "ring-gray-300",
            }),
        },
    ]),
) as Record<
    string,
    { label: string; icon: string; accent: string; ring: string }
>;
