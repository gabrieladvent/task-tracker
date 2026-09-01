<?php

namespace App\Observers;

use App\Enum\TaskActivityTypeEnum;
use App\Models\Task;
use App\Models\TaskActivity;
use BackedEnum;
use Illuminate\Support\Carbon;

class TaskObserver
{
    private const TRACKED_FIELDS = [
        'title',
        'description',
        'priority',
        'story_points',
        'project_id',
        'task_date',
    ];

    public function created(Task $task): void
    {
        if ($task->parent_task_id === null) {
            $this->record($task, TaskActivityTypeEnum::CREATED, to: [
                'status' => $this->scalar($task->status),
                'priority' => $this->scalar($task->priority),
            ]);

            return;
        }

        $previous = Task::inChain($task->parent_task_id)
            ->whereKeyNot($task->getKey())
            ->orderByDesc('task_date')
            ->first();

        $this->record($task, TaskActivityTypeEnum::CARRIED_OVER,
            from: $previous?->task_date?->format('Y-m-d'),
            to: $task->task_date?->format('Y-m-d'),
        );
    }

    public function updated(Task $task): void
    {
        foreach ($task->getChanges() as $field => $newValue) {
            $from = $task->getRawOriginal($field);

            if ($field === 'status') {
                $this->record($task, TaskActivityTypeEnum::STATUS_CHANGED,
                    field: 'status',
                    from: $this->scalar($from),
                    to: $this->scalar($newValue),
                );

                continue;
            }

            if ($field === 'link_pull_request') {
                $this->record($task, TaskActivityTypeEnum::PR_LINKED,
                    field: 'link_pull_request',
                    from: $this->scalar($from),
                    to: $this->scalar($newValue),
                );

                continue;
            }

            if (! in_array($field, self::TRACKED_FIELDS, true)) {
                continue;
            }

            $this->record($task, TaskActivityTypeEnum::FIELD_CHANGED,
                field: $field,
                from: $this->normalizeField($field, $from),
                to: $this->normalizeField($field, $newValue),
            );
        }
    }

    public function deleted(Task $task): void
    {
        $this->record($task, TaskActivityTypeEnum::DELETED, from: [
            'title' => $task->title,
            'status' => $this->scalar($task->status),
        ]);
    }

    private function record(
        Task $task,
        TaskActivityTypeEnum $type,
        ?string $field = null,
        mixed $from = null,
        mixed $to = null,
    ): void {
        TaskActivity::create([
            'root_task_id' => $task->getOriginalTaskId(),
            'task_id' => $task->getKey(),
            'type' => $type,
            'field' => $field,
            'from_value' => $from,
            'to_value' => $to,
            'task_date' => $task->task_date?->format('Y-m-d'),
            'occurred_at' => now(),
        ]);
    }

    private function normalizeField(string $field, mixed $value): mixed
    {
        if ($field === 'task_date' && $value !== null) {
            return Carbon::parse($value)->format('Y-m-d');
        }

        return $this->scalar($value);
    }

    private function scalar(mixed $value): mixed
    {
        return $value instanceof BackedEnum ? $value->value : $value;
    }
}
