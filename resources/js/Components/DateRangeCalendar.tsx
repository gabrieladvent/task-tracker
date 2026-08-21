import {
    addDays,
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isAfter,
    isBefore,
    isSameDay,
    isSameMonth,
    setMonth,
    setYear,
    startOfDay,
    startOfMonth,
    startOfWeek,
    subMonths,
} from 'date-fns';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface DateRange {
    start: Date | null;
    end: Date | null;
}

interface DateRangeCalendarProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
    /** How many months to render side by side. Collapses to one on small screens. */
    months?: number;
    /** How far the year dropdown reaches around the current year. */
    yearRange?: number;
    className?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Every date rendered for a month, padded out to whole weeks. */
function monthGrid(month: Date): Date[] {
    return eachDayOfInterval({
        start: startOfWeek(startOfMonth(month)),
        end: endOfWeek(endOfMonth(month)),
    });
}

/** Split a padded month grid into calendar weeks so each can be an ARIA row. */
function weeksOf(month: Date): Date[][] {
    const days = monthGrid(month);
    return Array.from({ length: days.length / 7 }, (_, i) =>
        days.slice(i * 7, i * 7 + 7),
    );
}

function isBetween(day: Date, start: Date, end: Date): boolean {
    return !isBefore(day, start) && !isAfter(day, end);
}

/** Months slide in from whichever side the user navigated towards. */
const slideVariants: Variants = {
    enter: (direction: number) => ({
        x: direction >= 0 ? 48 : -48,
        opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
        x: direction >= 0 ? -48 : 48,
        opacity: 0,
    }),
};

const gridVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.008, delayChildren: 0.02 } },
};

const dayVariants: Variants = {
    hidden: { opacity: 0, y: 8, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 500, damping: 32 },
    },
};

/**
 * Range calendar built on date-fns + Tailwind, so it inherits the app's dark
 * mode and spacing instead of fighting a third-party stylesheet. The grid is a
 * roving-tabindex composite widget: one day owns the tab stop and the arrow
 * keys move focus, which is how a date grid is expected to behave.
 */
export default function DateRangeCalendar({
    value,
    onChange,
    months = 2,
    yearRange = 5,
    className = '',
}: DateRangeCalendarProps) {
    const [viewMonth, setViewMonth] = useState<Date>(() =>
        startOfMonth(value.start ?? new Date()),
    );
    const [direction, setDirection] = useState(0);
    const [hovered, setHovered] = useState<Date | null>(null);
    const [focusedDay, setFocusedDay] = useState<Date>(
        () => value.start ?? startOfDay(new Date()),
    );
    // Only steal focus for keyboard navigation, never on first paint.
    const shouldFocus = useRef(false);
    const gridRef = useRef<HTMLDivElement>(null);

    // A half-open range: `start` is picked, `end` is still being chosen.
    const isPicking = value.start !== null && value.end === null;

    const goToMonth = (next: Date) => {
        setDirection(isBefore(next, viewMonth) ? -1 : 1);
        setViewMonth(startOfMonth(next));
    };

    useEffect(() => {
        if (!shouldFocus.current) return;

        // Arrowing across a month boundary swaps the grid behind an exit/enter
        // animation, so the target button may not exist yet. Poll a bounded
        // number of frames rather than dropping focus on the floor.
        let frames = 0;
        let raf = 0;
        const grab = () => {
            const target = gridRef.current?.querySelector<HTMLButtonElement>(
                'button[tabindex="0"]',
            );
            if (target) {
                shouldFocus.current = false;
                target.focus();
                return;
            }
            if (frames++ < 30) raf = requestAnimationFrame(grab);
        };
        raf = requestAnimationFrame(grab);
        return () => cancelAnimationFrame(raf);
    }, [focusedDay, viewMonth]);

    const visibleMonths = useMemo(
        () => Array.from({ length: months }, (_, i) => addMonths(viewMonth, i)),
        [viewMonth, months],
    );

    // The grid needs exactly one tab stop. If the focused day scrolled out of
    // view (month dropdown, next/prev), fall back to the first visible day.
    const tabbableDay = useMemo(() => {
        const inView = visibleMonths.some((month) =>
            isSameMonth(focusedDay, month),
        );
        return inView ? focusedDay : startOfMonth(viewMonth);
    }, [focusedDay, visibleMonths, viewMonth]);

    const years = useMemo(() => {
        const current = new Date().getFullYear();
        return Array.from(
            { length: yearRange * 2 + 1 },
            (_, i) => current - yearRange + i,
        );
    }, [yearRange]);

    // While picking an end date, hovering (or arrowing) previews the range.
    const previewEnd = isPicking ? hovered : null;

    const handleSelect = (day: Date) => {
        if (!isPicking) {
            onChange({ start: day, end: null });
            setHovered(null);
            return;
        }
        const start = value.start as Date;
        onChange(
            isBefore(day, start)
                ? { start: day, end: start }
                : { start, end: day },
        );
        setHovered(null);
    };

    const moveFocus = (next: Date) => {
        shouldFocus.current = true;
        setFocusedDay(next);
        if (isPicking) setHovered(next);
        // Keep the focused day on screen without jumping past months already shown.
        const first = startOfMonth(viewMonth);
        const last = endOfMonth(addMonths(viewMonth, months - 1));
        if (isBefore(next, first)) goToMonth(next);
        if (isAfter(next, last)) goToMonth(subMonths(next, months - 1));
    };

    const handleKeyDown = (event: React.KeyboardEvent, day: Date) => {
        const moves: Record<string, () => Date> = {
            ArrowLeft: () => addDays(day, -1),
            ArrowRight: () => addDays(day, 1),
            ArrowUp: () => addDays(day, -7),
            ArrowDown: () => addDays(day, 7),
            Home: () => startOfWeek(day),
            End: () => endOfWeek(day),
            PageUp: () => subMonths(day, 1),
            PageDown: () => addMonths(day, 1),
        };
        const move = moves[event.key];
        if (move) {
            event.preventDefault();
            moveFocus(move());
            return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleSelect(day);
        }
    };

    /** How a given day relates to the committed range or the hover preview. */
    const dayState = (day: Date) => {
        const { start, end } = value;
        const rangeEnd = end ?? previewEnd;
        const isEdge = Boolean(
            (start && isSameDay(day, start)) || (end && isSameDay(day, end)),
        );
        const inRange = Boolean(
            start &&
            rangeEnd &&
            (isBefore(rangeEnd, start)
                ? isBetween(day, rangeEnd, start)
                : isBetween(day, start, rangeEnd)),
        );
        return { isEdge, inRange: inRange && !isEdge };
    };

    const selectClasses =
        'rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-base font-medium text-gray-900 transition-colors focus:border-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-gray-300 dark:focus:ring-gray-300/20';

    const navClasses =
        'flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white dark:focus-visible:ring-gray-300';

    return (
        <div
            className={`rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-600 dark:bg-gray-800 ${className}`}
        >
            <div className="mb-6 flex items-center justify-between gap-3">
                <motion.button
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    onClick={() => goToMonth(subMonths(viewMonth, 1))}
                    className={navClasses}
                    aria-label="Previous month"
                >
                    <ChevronLeft className="h-5 w-5" />
                </motion.button>

                <div className="flex items-center gap-3">
                    <label className="sr-only" htmlFor="calendar-month">
                        Month
                    </label>
                    <select
                        id="calendar-month"
                        value={viewMonth.getMonth()}
                        onChange={(e) =>
                            goToMonth(
                                setMonth(viewMonth, Number(e.target.value)),
                            )
                        }
                        className={selectClasses}
                    >
                        {Array.from({ length: 12 }, (_, m) => (
                            <option key={m} value={m}>
                                {format(new Date(2000, m, 1), 'MMMM')}
                            </option>
                        ))}
                    </select>

                    <label className="sr-only" htmlFor="calendar-year">
                        Year
                    </label>
                    <select
                        id="calendar-year"
                        value={viewMonth.getFullYear()}
                        onChange={(e) =>
                            goToMonth(
                                setYear(viewMonth, Number(e.target.value)),
                            )
                        }
                        className={selectClasses}
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                <motion.button
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    onClick={() => goToMonth(addMonths(viewMonth, 1))}
                    className={navClasses}
                    aria-label="Next month"
                >
                    <ChevronRight className="h-5 w-5" />
                </motion.button>
            </div>

            <div ref={gridRef} onMouseLeave={() => setHovered(null)}>
                <AnimatePresence initial={false} mode="wait" custom={direction}>
                    <motion.div
                        key={viewMonth.toISOString()}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="grid gap-8 sm:grid-cols-2"
                    >
                        {visibleMonths.map((month) => (
                            <div
                                key={month.toISOString()}
                                // The second month is redundant on narrow screens.
                                className={
                                    isSameMonth(month, viewMonth)
                                        ? ''
                                        : 'hidden sm:block'
                                }
                            >
                                <div className="mb-3 text-center text-base font-semibold text-gray-900 dark:text-gray-100">
                                    {format(month, 'MMMM yyyy')}
                                </div>

                                <div
                                    role="grid"
                                    aria-label={format(month, 'MMMM yyyy')}
                                >
                                    <div
                                        className="grid grid-cols-7"
                                        role="row"
                                    >
                                        {WEEKDAYS.map((weekday) => (
                                            <div
                                                key={weekday}
                                                role="columnheader"
                                                aria-label={weekday}
                                                className="py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                                            >
                                                {weekday.slice(0, 2)}
                                            </div>
                                        ))}
                                    </div>

                                    <motion.div
                                        variants={gridVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {weeksOf(month).map((week) => (
                                            <div
                                                key={week[0].toISOString()}
                                                role="row"
                                                className="grid grid-cols-7"
                                            >
                                                {week.map((day) => {
                                                    const outside =
                                                        !isSameMonth(
                                                            day,
                                                            month,
                                                        );
                                                    const { isEdge, inRange } =
                                                        dayState(day);
                                                    const isToday = isSameDay(
                                                        day,
                                                        new Date(),
                                                    );

                                                    return (
                                                        <motion.button
                                                            key={day.toISOString()}
                                                            type="button"
                                                            role="gridcell"
                                                            variants={
                                                                dayVariants
                                                            }
                                                            whileTap={
                                                                outside
                                                                    ? undefined
                                                                    : {
                                                                          scale: 0.88,
                                                                      }
                                                            }
                                                            disabled={outside}
                                                            tabIndex={
                                                                !outside &&
                                                                isSameDay(
                                                                    day,
                                                                    tabbableDay,
                                                                )
                                                                    ? 0
                                                                    : -1
                                                            }
                                                            aria-selected={
                                                                isEdge
                                                            }
                                                            aria-label={format(
                                                                day,
                                                                'EEEE, d MMMM yyyy',
                                                            )}
                                                            onClick={() => {
                                                                setFocusedDay(
                                                                    day,
                                                                );
                                                                handleSelect(
                                                                    day,
                                                                );
                                                            }}
                                                            onMouseEnter={() =>
                                                                isPicking &&
                                                                setHovered(day)
                                                            }
                                                            onKeyDown={(e) =>
                                                                handleKeyDown(
                                                                    e,
                                                                    day,
                                                                )
                                                            }
                                                            className={`relative flex h-12 w-full items-center justify-center text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-gray-300 dark:focus-visible:ring-offset-gray-800 ${
                                                                outside
                                                                    ? 'cursor-default text-gray-300 dark:text-gray-600'
                                                                    : isEdge
                                                                      ? 'font-bold text-white dark:text-gray-900'
                                                                      : inRange
                                                                        ? 'text-gray-900 dark:text-gray-100'
                                                                        : 'rounded-xl text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700'
                                                            }`}
                                                        >
                                                            {inRange && (
                                                                <motion.span
                                                                    aria-hidden="true"
                                                                    initial={{
                                                                        opacity: 0,
                                                                    }}
                                                                    animate={{
                                                                        opacity: 1,
                                                                    }}
                                                                    transition={{
                                                                        duration: 0.12,
                                                                    }}
                                                                    className="absolute inset-0 bg-gray-800/10 dark:bg-gray-100/15"
                                                                />
                                                            )}
                                                            {isEdge && (
                                                                <motion.span
                                                                    aria-hidden="true"
                                                                    initial={{
                                                                        scale: 0.4,
                                                                        opacity: 0,
                                                                    }}
                                                                    animate={{
                                                                        scale: 1,
                                                                        opacity: 1,
                                                                    }}
                                                                    transition={{
                                                                        type: 'spring',
                                                                        stiffness: 520,
                                                                        damping: 24,
                                                                    }}
                                                                    className="absolute inset-0 rounded-xl bg-gray-800 shadow-lg shadow-gray-900/20 dark:bg-gray-100 dark:shadow-black/40"
                                                                />
                                                            )}
                                                            {isToday &&
                                                                !isEdge &&
                                                                !outside && (
                                                                    <span
                                                                        aria-hidden="true"
                                                                        className="absolute bottom-1.5 h-1 w-1 rounded-full bg-gray-800 dark:bg-gray-100"
                                                                    />
                                                                )}
                                                            <span className="relative z-10">
                                                                {day.getDate()}
                                                            </span>
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </motion.div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
