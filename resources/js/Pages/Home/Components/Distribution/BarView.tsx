import { motion } from 'framer-motion';
import { ProjectDistributionRow } from '../../types/dashboard';

interface Props {
    rows: ProjectDistributionRow[];
}

export function BarView({ rows }: Props) {
    const max = Math.max(...rows.map((row) => row.total), 1);

    return (
        <ul className="flex flex-col gap-3">
            {rows.map((row, i) => (
                <li key={row.id ?? 'none'}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                            <span className="text-xs text-gray-600 dark:text-gray-300 truncate">{row.name}</span>
                        </span>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-2 shrink-0">
                            {row.total}
                            <span className="text-gray-400 dark:text-gray-500 font-normal"> · {row.share_pct}%</span>
                        </span>
                    </div>

                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(row.total / max) * 100}%` }}
                            transition={{ duration: 0.6, delay: 0.15 + i * 0.06 }}
                            style={{ backgroundColor: row.color }}
                            className="h-full rounded-full"
                        />
                    </div>

                    <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5">
                        {row.done}/{row.total} done
                    </p>
                </li>
            ))}
        </ul>
    );
}
