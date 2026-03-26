export const STATUS_COLOR: Record<string, string> = {
    todo: "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
    in_progress:
        "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    code_review:
        "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
    ready_qa:
        "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
    ready_dev:
        "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
    on_hold:
        "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    done: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
    cancelled: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
};

export const STATUS_LABEL: Record<string, string> = {
    todo: "Pending",
    in_progress: "In Progress",
    code_review: "Code Review",
    ready_qa: "Ready QA",
    ready_dev: "Ready Dev",
    on_hold: "On Hold",
    done: "Done",
    cancelled: "Cancelled",
};

export const PRIORITY_COLOR: Record<string, string> = {
    low: "text-gray-400",
    medium: "text-amber-500",
    high: "text-red-500",
};
