import { motion } from 'framer-motion';
import { ProjectDistributionRow } from '../../types/dashboard';
import { donutSlice } from './layout';

interface Props {
    rows: ProjectDistributionRow[];
    total: number;
}

const SIZE = 220;
const CENTER = SIZE / 2;

export function DonutView({ rows, total }: Props) {
    let cursor = -Math.PI / 2;

    const slices = rows.map((row) => {
        const sweep = total > 0 ? (row.total / total) * Math.PI * 2 : 0;
        const slice = { row, from: cursor, to: cursor + sweep };

        cursor += sweep;

        return slice;
    });

    return (
        <div className="flex justify-center">
            <svg
                role="img"
                aria-label="Share of tasks per project"
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                className="w-full h-auto max-w-[160px]"
            >
                {slices.map((slice, i) => (
                    <motion.path
                        key={slice.row.id ?? 'none'}
                        d={donutSlice(CENTER, CENTER, 100, 62, slice.from, slice.to)}
                        fill={slice.row.color}
                        fillOpacity={0.85}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.35, delay: 0.1 + i * 0.06 }}
                    >
                        <title>{`${slice.row.name}: ${slice.row.total} tasks (${slice.row.share_pct}%)`}</title>
                    </motion.path>
                ))}

                <text
                    x={CENTER}
                    y={CENTER - 6}
                    textAnchor="middle"
                    className="fill-gray-800 dark:fill-gray-100"
                    fontSize={26}
                    fontWeight={700}
                >
                    {total}
                </text>
                <text
                    x={CENTER}
                    y={CENTER + 14}
                    textAnchor="middle"
                    className="fill-gray-400 dark:fill-gray-500"
                    fontSize={11}
                >
                    tasks
                </text>
            </svg>
        </div>
    );
}
