<?php

namespace App\Services;

use App\Enum\StatusEnum;
use App\Models\Period;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class PeriodServices
{
    public function getPeriodsWithStats(): Collection
    {
        return Period::with(['tasks:id,period_id,status,parent_task_id,task_date'])
            ->orderByDesc('start_date')
            ->get()
            ->map(function ($period) {
                $uniqueTasks = $period->tasks
                    ->groupBy(fn ($task) => $task->parent_task_id ?? $task->id)
                    ->map(fn ($versions) => $versions->sortByDesc('task_date')->first());

                return [
                    'id' => $period->id,
                    'name' => $period->display_name,
                    'start_date' => $period->start_date->format('Y-m-d'),
                    'end_date' => $period->end_date->format('Y-m-d'),
                    'tasks_count' => $uniqueTasks->count(),
                    'completed_tasks_count' => $uniqueTasks->where('status.value', 'done')->count(),
                    'is_current' => $period->start_date->lte(Carbon::today()) &&
                        $period->end_date->gte(Carbon::today()),
                ];
            });
    }

    public function getPeriodDetails(Period $period): array
    {
        $period->loadCount([
            'tasks',
            'tasks as completed_tasks_count' => fn ($query) => $query->where('status', 'done'),
        ]);

        return [
            'period' => $this->formatPeriodBasicInfo($period),
            'tasksByDate' => $this->getTasksGroupedByDate($period),
            'calendarData' => $this->generateCalendarData($period),
            'boardData' => $this->getBoardData($period),
        ];
    }

    private function getBoardData(Period $period): array
    {
        $tasks = $period->tasks()
            ->with('project:id,name')
            ->select([
                'id',
                'title',
                'description',
                'status',
                'priority',
                'story_points',
                'project_id',
                'notes',
                'link_pull_request',
                'task_date',
                'parent_task_id',
                'created_at',
                'status_changed_at',
            ])
            ->orderBy('task_date')
            ->get();

        $uniqueTasks = $tasks
            ->groupBy(fn ($task) => $task->parent_task_id ?? $task->id)
            ->map(fn ($versions) => $versions->sortByDesc('task_date')->first());

        $tasksByStatus = $uniqueTasks->groupBy(fn ($task) => $task->status->value);

        $statusOrder = collect(StatusEnum::cases())->sortBy(fn ($s) => $s->sortOrder());

        $columns = $statusOrder->map(function (StatusEnum $statusEnum) use ($tasksByStatus) {
            $statusValue = $statusEnum->value;
            $statusTasks = $tasksByStatus->get($statusValue, collect());

            return [
                'status' => $statusValue,
                'label' => $statusEnum->label(),
                'color' => $statusEnum->color(),
                'bg' => '',
                'tasks' => $statusTasks->map(fn ($task) => array_merge(
                    [
                        'id' => (string) $task->id,
                        'title' => $task->title,
                        'description' => $task->description ?? '',
                        'status' => $task->status->value,
                        'priority' => $task->priority->value,
                        'story_points' => $task->story_points,
                        'project_id' => (string) ($task->project_id ?? ''),
                        'project_name' => $task->project?->name,
                        'project_color' => null,
                        'notes' => $task->notes ?? '',
                        'link_pull_request' => $task->link_pull_request ?? '',
                        'task_date' => $task->task_date?->format('Y-m-d'),
                        'project' => $task->project?->name,
                    ],
                    $this->resolveTaskFlags($task)
                ))->values(),
            ];
        })->values();

        return ['columns' => $columns];
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

    private function resolveTaskFlags(object $task, ?string $date = null): array
    {
        $dateCarbon = Carbon::parse($date);

        $createdDate = Carbon::parse($task->created_at)->startOfDay();

        $taskStart = $task->task_date->copy()->startOfDay();

        $isNewToday = $createdDate->eq($dateCarbon->copy()->startOfDay())
            && $taskStart->eq($dateCarbon->copy()->startOfDay())
            && $task->parent_task_id === null;

        $isCarryOver = $taskStart->lt($dateCarbon->copy()->startOfDay());

        return [
            'is_new_today' => $isNewToday,
            'is_carry_over' => $isCarryOver,
            'is_status_changed_today' => $task->status_changed_at !== null
                && Carbon::parse($task->status_changed_at)->startOfDay()->eq($dateCarbon->copy()->startOfDay()),
        ];
    }

    private function getTasksGroupedByDate(Period $period): Collection
    {
        $start = $period->start_date->copy();

        $end = $period->end_date->copy();

        $tasks = $period->tasks()
            ->with('project:id,name')
            ->get();

        $dateRange = collect();

        $current = $start->copy();

        while ($current->lte($end)) {
            $dateRange->push($current->format('Y-m-d'));

            $current->addDay();
        }

        return $dateRange
            ->map(function ($date) use ($tasks) {
                $activeTasks = $tasks->filter(function ($task) use ($date) {
                    $taskDate = $task->task_date->format('Y-m-d');
                    $endDate = $task->end_date ? $task->end_date->format('Y-m-d') : $taskDate;

                    return $taskDate <= $date && $endDate >= $date;
                });

                if ($activeTasks->isEmpty()) {
                    return null;
                }

                return [
                    'date' => $date,
                    'day_name' => Carbon::parse($date)->format('l'),
                    'formatted_date' => Carbon::parse($date)->format('d M Y'),
                    'tasks' => $activeTasks
                        ->sortBy(fn ($task) => $task->status->sortOrder())
                        ->map(fn ($task) => array_merge([
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
                            'end_date' => $task->end_date?->format('Y-m-d'),
                        ], $this->resolveTaskFlags($task, $date)))
                        ->values(),
                ];
            })
            ->filter()
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

        $calendarStart = $start->copy()->startOfWeek(Carbon::SUNDAY);

        $calendarEnd = $end->copy()->endOfWeek(Carbon::SATURDAY);

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
            ->select([
                'id',
                'title',
                'status',
                'priority',
                'story_points',
                'project_id',
                'description',
                'link_pull_request',
                'notes',
                'task_date',
                'end_date',
                'parent_task_id',
                'created_at',
                'status_changed_at',
            ])
            ->orderBy('task_date')
            ->orderBy('created_at')
            ->get();

        $start = $period->start_date->copy();

        $end = $period->end_date->copy();

        $taskCounts = collect();

        $formattedTasks = collect();

        $current = $start->copy();

        while ($current->lte($end)) {
            $dateStr = $current->format('Y-m-d');

            $activeTasks = $tasks->filter(function ($task) use ($dateStr) {
                $taskDate = $task->task_date->format('Y-m-d');
                $endDate = $task->end_date ? $task->end_date->format('Y-m-d') : $taskDate;

                return $taskDate <= $dateStr && $endDate >= $dateStr;
            });

            if ($activeTasks->isNotEmpty()) {
                $completed = $activeTasks->filter(fn ($t) => $t->status->value === 'done')->count();

                $taskCounts[$dateStr] = [
                    'count' => $activeTasks->count(),
                    'completed' => $completed,
                ];

                $formattedTasks[$dateStr] = $activeTasks
                    ->sortBy(fn ($t) => $t->status->sortOrder())
                    ->map(fn ($task) => array_merge([
                        'id' => $task->id,
                        'title' => $task->title,
                        'status' => $task->status->value,
                        'priority' => $task->priority->value,
                        'story_points' => $task->story_points,
                        'project' => $task->project?->name,
                        'project_id' => $task->project_id,
                        'description' => $task->description,
                        'link_pull_request' => $task->link_pull_request,
                        'notes' => $task->notes,
                        'task_date' => $task->task_date->format('Y-m-d'),
                        'end_date' => $task->end_date?->format('Y-m-d'),
                    ], $this->resolveTaskFlags($task, $dateStr)))
                    ->values()
                    ->toArray();
            }

            $current->addDay();
        }

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
