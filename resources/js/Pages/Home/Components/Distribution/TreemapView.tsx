import { motion } from 'framer-motion';
import { ProjectDistributionRow } from '../../types/dashboard';
import { initials, readableTextOn, squarify } from './layout';

interface Props {
    rows: ProjectDistributionRow[];
}

const WIDTH = 320;
const HEIGHT = 180;

export function TreemapView({ rows }: Props) {
    const rects = squarify(
        rows.map((row, index) => ({ index, value: row.total })),
        WIDTH,
        HEIGHT
    );

    return (
        <svg
            role="img"
            aria-label="Task count per project, rectangle area proportional to the number of tasks"
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full h-auto"
        >
            {rects.map((rect, i) => {
                const row = rows[rect.index];
                // Full name plus the numbers only when both lines of text actually fit.
                const roomy = rect.width > 80 && rect.height > 36;

                return (
                    <motion.g
                        key={row.id ?? 'none'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.35, delay: 0.1 + i * 0.06 }}
                    >
                        <title>{`${row.name}: ${row.total} tasks (${row.share_pct}%)`}</title>

                        <rect
                            x={rect.x + 1}
                            y={rect.y + 1}
                            width={Math.max(rect.width - 2, 0)}
                            height={Math.max(rect.height - 2, 0)}
                            rx={4}
                            fill={row.color}
                            fillOpacity={0.85}
                        />

                        {rect.width > 34 && rect.height > 20 && (
                            <text
                                x={rect.x + 8}
                                y={rect.y + 18}
                                fill={readableTextOn(row.color)}
                                fontSize={11}
                                fontWeight={700}
                            >
                                {roomy ? row.name : initials(row.name)}
                            </text>
                        )}

                        {roomy && (
                            <text
                                x={rect.x + 8}
                                y={rect.y + 32}
                                fill={readableTextOn(row.color)}
                                fontSize={10}
                                fillOpacity={0.85}
                            >
                                {row.total} · {row.share_pct}%
                            </text>
                        )}
                    </motion.g>
                );
            })}
        </svg>
    );
}
