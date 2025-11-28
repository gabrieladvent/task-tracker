<?php

namespace App\Services;

use App\Models\Period;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class PeriodServices
{
    public function getPeriodsWithStats(): Collection
    {
        return Period::withCount([
            'tasks',
            'tasks as completed_tasks_count' => fn ($q) => $q->where('status', 'done'),
        ])
            ->orderByDesc('start_date')
            ->get()
            ->map(fn ($period) => [
                'id' => $period->id,
                'name' => $period->display_name,
                'start_date' => $period->start_date->format('Y-m-d'),
                'end_date' => $period->end_date->format('Y-m-d'),
                'tasks_count' => $period->tasks_count,
                'completed_tasks_count' => $period->completed_tasks_count,
                'is_current' => $period->start_date->lte(Carbon::today()) &&
                    $period->end_date->gte(Carbon::today()),
            ]);
    }

    public function getPeriodDetails(Period $period): array
    {
        $period->loadCount([
            'tasks',
            'tasks as completed_tasks_count' => fn ($q) => $q->where('status', 'done'),
        ]);

        return [
            'period' => $this->formatPeriodBasicInfo($period),
            'tasksByDate' => $this->getTasksGroupedByDate($period),
            'calendarData' => $this->generateCalendarData($period),
        ];
    }

    private function formatPeriodBasicInfo(Period $period): array
    {
        return [
            'id' => $period->id,
            'name' => $period->display_name,
            'start_date' => $period->start_date->format('Y-m-d'),
            'end_date' => $period->end_date->format('Y-m-d'),
            'tasks_count' => $period->tasks_count,
            'completed_tasks_count' => $period->completed_tasks_count,
        ];
    }

    private function getTasksGroupedByDate(Period $period): Collection
    {
        return $period->tasks()
            ->with('project:id,name')
            ->byDate()
            ->get()
            ->groupBy(fn ($task) => $task->task_date->format('Y-m-d'))
            ->map(fn ($tasks, $date) => [
                'date' => $date,
                'day_name' => Carbon::parse($date)->format('l'),
                'formatted_date' => Carbon::parse($date)->format('d M Y'),
                'tasks' => $tasks->map(fn ($task) => [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'link_pull_request' => $task->link_pull_request,
                    'notes' => $task->notes,
                    'status' => $task->status->value,
                    'priority' => $task->priority->value,
                    'story_points' => $task->story_points,
                    'project_id' => $task->project_id,
                    'project' => $task->project?->name,
                    'task_date' => $task->task_date->format('Y-m-d'),
                ])->values(),
            ])
            ->values();
    }

    private function generateCalendarData(Period $period): array
    {
        if (! $period->start_date || ! $period->end_date) {
            return [
                'weeks' => [],
                'month' => '',
            ];
        }

        $start = $period->start_date->copy();

        $end = $period->end_date->copy();

        $calendarStart = $start->copy()->startOfWeek();

        $calendarEnd = $end->copy()->endOfWeek();

        $tasksData = $this->getTasksDataForCalendar($period);

        $weeks = $this->buildCalendarWeeks(
            $calendarStart,
            $calendarEnd,
            $start,
            $end,
            $tasksData
        );

        return [
            'weeks' => $weeks,
            'month' => $start->format('F Y'),
        ];
    }

    private function getTasksDataForCalendar(Period $period): array
    {
        $tasks = $period->tasks()
            ->with('project:id,name')
            ->orderBy('task_date')
            ->orderBy('created_at')
            ->get();

        $tasksByDate = $tasks->groupBy(fn ($task) => $task->task_date->format('Y-m-d'));

        $taskCounts = $tasksByDate->map(function ($dateTasks) {
            return [
                'count' => $dateTasks->count(),
                'completed' => $dateTasks->where('status', 'done')->count(),
            ];
        });

        $formattedTasks = $tasksByDate->map(function ($dateTasks) {
            return $dateTasks->map(fn ($task) => [
                'id' => $task->id,
                'title' => $task->title,
                'status' => $task->status,
                'priority' => $task->priority,
                'story_points' => $task->story_points,
                'project' => $task->project?->name,
                'project_id' => $task->project_id,
                'description' => $task->description,
                'link_pull_request' => $task->link_pull_request,
                'notes' => $task->notes,
            ])->toArray();
        });

        return [
            'counts' => $taskCounts,
            'tasks' => $formattedTasks,
        ];
    }

    private function buildCalendarWeeks(
        Carbon $calendarStart,
        Carbon $calendarEnd,
        Carbon $periodStart,
        Carbon $periodEnd,
        array $tasksData
    ): array {
        $weeks = [];

        $currentWeek = [];

        $current = $calendarStart->copy();

        while ($current->lte($calendarEnd)) {
            $dateStr = $current->format('Y-m-d');

            $isInPeriod = $current->gte($periodStart) && $current->lte($periodEnd);

            $dayData = [
                'date' => $dateStr,
                'day' => $current->day,
                'is_in_period' => $isInPeriod,
                'is_today' => $current->isToday(),
                'tasks_count' => 0,
                'completed_count' => 0,
                'tasks' => [],
            ];

            if ($isInPeriod) {
                if (isset($tasksData['counts'][$dateStr])) {
                    $dayData['tasks_count'] = $tasksData['counts'][$dateStr]['count'];
                    $dayData['completed_count'] = $tasksData['counts'][$dateStr]['completed'];
                }

                if (isset($tasksData['tasks'][$dateStr])) {
                    $dayData['tasks'] = $tasksData['tasks'][$dateStr];
                }
            }

            $currentWeek[] = $dayData;

            if ($current->dayOfWeek === 6 || $current->eq($calendarEnd)) {
                $weeks[] = $currentWeek;
                $currentWeek = [];
            }

            $current->addDay();
        }

        return $weeks;
    }
}
