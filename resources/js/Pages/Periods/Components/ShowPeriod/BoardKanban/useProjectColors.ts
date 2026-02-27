import { useMemo } from "react";
import { BoardTask } from "@/Pages/Periods/types/period";
import { PROJECT_COLORS } from "./config";

export function useProjectColors(tasks: BoardTask[]) {
    return useMemo(() => {
        const map = new Map<string, string>();
        let idx = 0;
        tasks.forEach((t) => {
            const key = t.project_id || "__no_project__";
            if (!map.has(key)) {
                map.set(
                    key,
                    t.project_color ??
                        PROJECT_COLORS[idx++ % PROJECT_COLORS.length],
                );
            }
        });
        return map;
    }, [tasks]);
}
