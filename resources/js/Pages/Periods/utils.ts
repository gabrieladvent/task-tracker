export const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
        todo: "bg-gray-500",
        in_progress: "bg-blue-500",
        on_hold: "bg-amber-500",
        code_review: "bg-purple-500",
        done: "bg-green-500",
        cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
};

export const getStatusBadgeColor = (status: string): string => {
    const colors: Record<string, string> = {
        todo: "bg-gray-100 text-gray-700",
        in_progress: "bg-blue-100 text-blue-700",
        on_hold: "bg-amber-100 text-amber-700",
        code_review: "bg-purple-100 text-purple-700",
        done: "bg-green-100 text-green-700",
        cancelled: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
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
        low: "text-gray-600",
        medium: "text-amber-600",
        high: "text-red-600",
    };
    return colors[priority] || "text-gray-600";
};

export const truncateText = (text: string, maxLength: number = 25): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
};
