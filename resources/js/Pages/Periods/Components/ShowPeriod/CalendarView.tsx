import { motion } from 'framer-motion';
import { CalendarData, CalendarTask } from '@/Pages/Periods/types/period';
import CalendarDay from './CalendarDay';

interface CalendarViewProps {
    calendarData: CalendarData;
    onAddTask: (date: string) => void;
    onTaskClick: (task: CalendarTask) => void;
}

export default function CalendarView({ calendarData, onAddTask, onTaskClick }: CalendarViewProps) {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-white shadow-sm sm:rounded-lg"
        >
            <div className="p-6">
                <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mb-4 text-lg font-semibold text-gray-900"
                >
                    {calendarData.month}
                </motion.h3>

                <div className="grid grid-cols-7 gap-1">
                    {daysOfWeek.map((day) => (
                        <motion.div
                            key={day}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="p-2 text-center text-xs font-medium text-gray-500"
                        >
                            {day}
                        </motion.div>
                    ))}

                    {calendarData.weeks.map((week, weekIdx) => (
                        week.map((day, dayIdx) => (
                            <CalendarDay
                                key={`${weekIdx}-${dayIdx}`}
                                day={day}
                                onAddTask={onAddTask}
                                onTaskClick={onTaskClick}
                            />
                        ))
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
