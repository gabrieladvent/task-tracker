<?php

namespace App\Services;

use App\Enum\StatusEnum;
use App\Models\Task;
use App\Models\TaskActivity;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class TaskActivityService
{
    private const CLOSED_STATUSES = [StatusEnum::DONE, StatusEnum::CANCELLED];

    public function timelineFor(Task $task): array
    {
        $rootTaskId = $task->getOriginalTaskId();

        $versions = Task::inChain($rootTaskId)
            ->orderBy('task_date')
            ->orderBy('created_at')
            ->get(['id', 'task_date', 'status', 'created_at']);

        $activities = TaskActivity::forChain($rootTaskId)->chronological()->get();

        return [
            'summary' => $this->summarize($rootTaskId, $versions, $activities),
            'activities' => $activities->map(fn (TaskActivity $activity) => [
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
            ])->values(),
        ];
    }

    private function summarize(string $rootTaskId, Collection $versions, Collection $activities): array
    {
        $first = $versions->first();
        $last = $versions->last();

        $currentStatus = $last?->status;
        $isClosed = $currentStatus !== null && in_array($currentStatus, self::CLOSED_STATUSES, true);

        $startedOn = $first?->task_date;
        $lastActiveOn = $isClosed ? $last?->task_date : Carbon::today();

        return [
            'root_task_id' => $rootTaskId,
            'version_count' => $versions->count(),
            'carry_over_count' => max(0, $versions->count() - 1),
            'activity_count' => $activities->count(),
            'first_seen_at' => $first?->created_at?->toIso8601String(),
            'first_task_date' => $startedOn?->format('Y-m-d'),
            'last_task_date' => $last?->task_date?->format('Y-m-d'),
            'last_activity_at' => $activities->last()?->occurred_at?->toIso8601String(),
            'age_days' => $startedOn && $lastActiveOn
                ? (int) $startedOn->diffInDays($lastActiveOn)
                : 0,
            'current_status' => $currentStatus?->value,
            'is_open' => ! $isClosed,
        ];
    }
}
