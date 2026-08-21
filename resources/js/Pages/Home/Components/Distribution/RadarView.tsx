import { motion } from 'framer-motion';
import { ProjectDistributionRow } from '../../types/dashboard';
import { initials, radarPoint } from './layout';

interface Props {
    rows: ProjectDistributionRow[];
}

const SIZE = 260;
const CENTER = SIZE / 2;
const RADIUS = 86;
const RINGS = 4;

export function RadarView({ rows }: Props) {
    const count = rows.length;
    const max = Math.max(...rows.map((row) => row.total), 1);

    const polygon = (pick: (row: ProjectDistributionRow) => number) =>
        rows
            .map((row, i) => {
                const p = radarPoint(CENTER, CENTER, (pick(row) / max) * RADIUS, i, count);

                return `${p.x},${p.y}`;
            })
            .join(' ');

    return (
        <svg
            role="img"
            aria-label="Total and completed tasks per project"
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="w-full h-auto max-w-[190px] mx-auto"
        >
            {/* Grid rings */}
            {Array.from({ length: RINGS }, (_, ring) => (
                <polygon
                    key={ring}
                    points={rows
                        .map((_, i) => {
                            const p = radarPoint(CENTER, CENTER, (RADIUS * (ring + 1)) / RINGS, i, count);

                            return `${p.x},${p.y}`;
                        })
                        .join(' ')}
                    fill="none"
                    className="stroke-gray-200 dark:stroke-gray-700"
                    strokeWidth={1}
                />
            ))}

            {/* Axes + labels */}
            {rows.map((row, i) => {
                const edge = radarPoint(CENTER, CENTER, RADIUS, i, count);
                const label = radarPoint(CENTER, CENTER, RADIUS + 18, i, count);

                return (
                    <g key={row.id ?? 'none'}>
                        <line
                            x1={CENTER}
                            y1={CENTER}
                            x2={edge.x}
                            y2={edge.y}
                            className="stroke-gray-200 dark:stroke-gray-700"
                            strokeWidth={1}
                        />
                        <text
                            x={label.x}
                            y={label.y}
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="fill-gray-500 dark:fill-gray-400"
                            fontSize={10}
                            fontWeight={600}
                        >
                            <title>{`${row.name}: ${row.total} tasks, ${row.done} done`}</title>
                            {initials(row.name)}
                        </text>
                    </g>
                );
            })}

            <motion.polygon
                points={polygon((row) => row.total)}
                fill="#3b82f6"
                fillOpacity={0.16}
                stroke="#3b82f6"
                strokeWidth={2}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.15 }}
            />

            <motion.polygon
                points={polygon((row) => row.done)}
                fill="#10b981"
                fillOpacity={0.2}
                stroke="#10b981"
                strokeWidth={2}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
            />

            <g transform={`translate(8 ${SIZE - 14})`}>
                <rect width={9} height={9} y={-8} rx={2} fill="#3b82f6" fillOpacity={0.6} />
                <text x={14} className="fill-gray-500 dark:fill-gray-400" fontSize={10}>Total</text>
                <rect width={9} height={9} x={52} y={-8} rx={2} fill="#10b981" fillOpacity={0.7} />
                <text x={66} className="fill-gray-500 dark:fill-gray-400" fontSize={10}>Done</text>
            </g>
        </svg>
    );
}
