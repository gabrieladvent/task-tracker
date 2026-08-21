import { motion } from 'framer-motion';
import { ProjectDistributionRow } from '../../types/dashboard';
import { circleBounds, initials, packCircles, readableTextOn } from './layout';

interface Props {
    rows: ProjectDistributionRow[];
}

export function BubbleView({ rows }: Props) {
    const circles = packCircles(rows.map((row) => row.total));
    const box = circleBounds(circles);
    const pad = box.width * 0.04;

    return (
        <svg
            role="img"
            aria-label="Task count per project, circle area proportional to the number of tasks"
            viewBox={`${box.x - pad} ${box.y - pad} ${box.width + pad * 2} ${box.height + pad * 2}`}
            className="w-full h-auto max-h-40"
        >
            {circles.map((circle, i) => {
                const row = rows[circle.index];
                const label = initials(row.name);
                const fits = circle.r > box.width * 0.07;

                return (
                    <motion.g
                        key={row.id ?? 'none'}
                        initial={{ opacity: 0, scale: 0.4 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
                        style={{ transformOrigin: `${circle.x}px ${circle.y}px` }}
                    >
                        <title>{`${row.name}: ${row.total} tasks (${row.share_pct}%)`}</title>

                        <circle cx={circle.x} cy={circle.y} r={circle.r} fill={row.color} fillOpacity={0.85} />

                        {fits && (
                            <text
                                x={circle.x}
                                y={circle.y}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill={readableTextOn(row.color)}
                                fontSize={circle.r * 0.42}
                                fontWeight={700}
                            >
                                {label}
                            </text>
                        )}
                    </motion.g>
                );
            })}
        </svg>
    );
}
