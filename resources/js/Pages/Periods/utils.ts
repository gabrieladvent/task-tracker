export const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
        todo: "bg-gray-500 dark:bg-gray-600",
        in_progress: "bg-blue-500 dark:bg-blue-600",
        on_hold: "bg-amber-500 dark:bg-amber-600",
        code_review: "bg-purple-500 dark:bg-purple-600",
        done: "bg-green-500 dark:bg-green-600",
        cancelled: "bg-red-500 dark:bg-red-600",
    };
    return colors[status] || "bg-gray-500 dark:bg-gray-600";
};

export const getStatusBadgeColor = (status: string): string => {
    const colors: Record<string, string> = {
        todo: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
        in_progress:
            "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
        on_hold:
            "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
        code_review:
            "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
        done: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
        cancelled:
            "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    };
    return (
        colors[status] ||
        "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
    );
};

export const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
        todo: "Todo",
        in_progress: "In Progress",
        on_hold: "On Hold",
        code_review: "Code Review",
        done: "Done",
        cancelled: "Cancelled",
    };
    return labels[status] || status;
};

export const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
        low: "text-gray-600 dark:text-gray-400",
        medium: "text-amber-600 dark:text-amber-400",
        high: "text-red-600 dark:text-red-400",
    };
    return colors[priority] || "text-gray-600 dark:text-gray-400";
};

export const getPriorityBadgeColor = (priority: string): string => {
    const colors: Record<string, string> = {
        low: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
        medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
        high: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    };
    return (
        colors[priority] ||
        "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
    );
};

export const truncateText = (text: string, maxLength: number = 25): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
};
