<?php

namespace App\Services;

use App\Enum\StatusEnum;
use App\Enum\TaskActivityTypeEnum;
use App\Models\Task;
use App\Models\TaskActivity;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Turns the raw activity log into a day-by-day digest: "what did I actually
 * touch yesterday, and where did it move?".
 *
 * Events are grouped day -> task chain -> events, so a task edited eight times
 * in one afternoon reads as one entry with eight changes rather than eight
 * disconnected rows.
 */
class ActivityDigestService
{
    public function digest(Carbon $from, Carbon $to, ?string $projectId = null): array
    {
        $activities = TaskActivity::query()
            ->whereBetween('occurred_at', [$from->copy()->startOfDay(), $to->copy()->endOfDay()])
            ->chronological()
            ->get();

        $chains = $this->resolveChains($activities->pluck('root_task_id')->unique());

        if ($projectId !== null) {
            $activities = $activities->filter(
                fn (TaskActivity $activity) => ($chains[$activity->root_task_id]['project_id'] ?? null) === $projectId
            );
        }

        $days = $activities
            ->groupBy(fn (TaskActivity $activity) => $activity->occurred_at->format('Y-m-d'))
            ->map(fn (Collection $dayActivities, string $date) => $this->buildDay($date, $dayActivities, $chains))
            ->sortKeysDesc()
            ->values();

        return [
            'days' => $days->all(),
            'totals' => $this->summarize($activities) + [
                'active_days' => $days->count(),
                'active_tasks' => $activities->pluck('root_task_id')->unique()->count(),
            ],
        ];
    }

    /**
     * One entry per chain root, describing the chain as it stands today: the
     * most recent copy's title, project and status.
     */
    private function resolveChains(Collection $rootIds): array
    {
        if ($rootIds->isEmpty()) {
            return [];
        }

        $tasks = Task::query()
            ->whereIn('id', $rootIds)
            ->orWhereIn('parent_task_id', $rootIds)
            ->with('project:id,name,color')
            ->get(['id', 'parent_task_id', 'period_id', 'project_id', 'title', 'status', 'task_date']);

        return Task::latestVersions($tasks)
            ->mapWithKeys(fn (Task $task) => [
                $task->getOriginalTaskId() => [
                    'task_id' => (string) $task->id,
                    'period_id' => (string) $task->period_id,
                    'title' => $task->title,
                    'status' => $task->status->value,
                    'project_id' => $task->project_id,
                    'project' => $task->project ? [
                        'id' => (string) $task->project->id,
                        'name' => $task->project->name,
                        'color' => $task->project->color,
                    ] : null,
                ],
            ])
            ->all();
    }

    private function buildDay(string $date, Collection $dayActivities, array $chains): array
    {
        $day = Carbon::parse($date);

        $tasks = $dayActivities
            ->groupBy('root_task_id')
            ->map(function (Collection $taskActivities, string $rootTaskId) use ($chains) {
                $chain = $chains[$rootTaskId] ?? $this->fallbackChain($taskActivities);

                return [
                    'root_task_id' => $rootTaskId,
                    'task_id' => $chain['task_id'],
                    'period_id' => $chain['period_id'],
                    'title' => $chain['title'],
                    'status' => $chain['status'],
                    'project' => $chain['project'],
                    'is_deleted' => $chain['task_id'] === null,
                    'activities' => $taskActivities
                        ->map(fn (TaskActivity $activity) => $this->presentActivity($activity))
                        ->values()
                        ->all(),
                ];
            })
            ->sortByDesc(fn (array $task) => $task['activities'][count($task['activities']) - 1]['occurred_at'])
            ->values();

        return [
            'date' => $date,
            'day_name' => $day->format('l'),
            'formatted_date' => $day->format('d M Y'),
            'is_today' => $day->isToday(),
            'summary' => $this->summarize($dayActivities),
            'tasks' => $tasks->all(),
        ];
    }

    /**
     * The chain's task rows are gone — reconstruct what we can from the log
     * itself, which deliberately outlives them.
     */
    private function fallbackChain(Collection $taskActivities): array
    {
        $deletion = $taskActivities->firstWhere('type', TaskActivityTypeEnum::DELETED);

        return [
            'task_id' => null,
            'period_id' => null,
            'title' => data_get($deletion?->from_value, 'title') ?? 'Deleted task',
            'status' => data_get($deletion?->from_value, 'status'),
            'project_id' => null,
            'project' => null,
        ];
    }

    private function presentActivity(TaskActivity $activity): array
    {
        return [
            'id' => (string) $activity->id,
            'task_id' => $activity->task_id ? (string) $activity->task_id : null,
            'type' => $activity->type->value,
            'label' => $activity->type->label(),
            'color' => $activity->type->color(),
            'field' => $activity->field,
            'from' => $activity->from_value,
            'to' => $activity->to_value,
            'task_date' => $activity->task_date?->format('Y-m-d'),
            'occurred_at' => $activity->occurred_at->toIso8601String(),
        ];
    }

    private function summarize(Collection $activities): array
    {
        $byType = $activities->countBy(fn (TaskActivity $activity) => $activity->type->value);

        return [
            'created' => $byType->get(TaskActivityTypeEnum::CREATED->value, 0),
            'carried_over' => $byType->get(TaskActivityTypeEnum::CARRIED_OVER->value, 0),
            'status_changed' => $byType->get(TaskActivityTypeEnum::STATUS_CHANGED->value, 0),
            'updated' => $byType->get(TaskActivityTypeEnum::FIELD_CHANGED->value, 0)
                + $byType->get(TaskActivityTypeEnum::PR_LINKED->value, 0),
            'completed' => $activities
                ->where('type', TaskActivityTypeEnum::STATUS_CHANGED)
                ->where('to_value', StatusEnum::DONE->value)
                ->count(),
            'total' => $activities->count(),
        ];
    }
}
