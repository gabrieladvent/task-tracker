<?php

namespace App\Console\Commands;

use App\Enum\TaskActivityTypeEnum;
use App\Models\Task;
use App\Models\TaskActivity;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class BackfillTaskActivities extends Command
{
    protected $signature = 'tasks:backfill-activities
                            {--fresh : Wipe the activity log first and rebuild it from scratch}';

    protected $description = 'Reconstruct the task activity log for tasks that existed before logging was added';

    public function handle(): int
    {
        if ($this->option('fresh')) {
            TaskActivity::query()->delete();
            $this->warn('Existing activity log wiped.');
        }

        $alreadyLogged = TaskActivity::query()->pluck('task_id')->filter()->flip();

        $tasks = Task::query()
            ->orderBy('created_at')
            ->get(['id', 'parent_task_id', 'status', 'priority', 'task_date', 'created_at', 'status_changed_at']);

        $rows = [];

        foreach ($tasks as $task) {
            if ($alreadyLogged->has($task->id)) {
                continue;
            }

            $isCarryOver = $task->parent_task_id !== null;

            $rows[] = $this->row($task, $isCarryOver
                ? TaskActivityTypeEnum::CARRIED_OVER
                : TaskActivityTypeEnum::CREATED,
                to: $isCarryOver
                    ? $task->task_date?->format('Y-m-d')
                    : ['status' => $task->status->value, 'priority' => $task->priority->value],
                occurredAt: $task->created_at,
            );

            // status_changed_at only keeps the most recent transition, so the
            // best we can reconstruct is "it landed on this status, then".
            if ($task->status_changed_at !== null) {
                $rows[] = $this->row($task, TaskActivityTypeEnum::STATUS_CHANGED,
                    field: 'status',
                    to: $task->status->value,
                    occurredAt: $task->status_changed_at,
                );
            }
        }

        if ($rows === []) {
            $this->info('Nothing to backfill — every task already has history.');

            return Command::SUCCESS;
        }

        foreach (array_chunk($rows, 500) as $chunk) {
            TaskActivity::insert($chunk);
        }

        $this->info('Backfilled '.count($rows).' activity record(s) for '.$tasks->count().' task(s).');

        return Command::SUCCESS;
    }

    private function row(Task $task, TaskActivityTypeEnum $type, ?string $field = null, mixed $to = null, $occurredAt = null): array
    {
        return [
            'id' => (string) Str::uuid(),
            'root_task_id' => $task->getOriginalTaskId(),
            'task_id' => $task->id,
            'type' => $type->value,
            'field' => $field,
            'from_value' => null,
            'to_value' => json_encode($to),
            'task_date' => $task->task_date?->format('Y-m-d'),
            'occurred_at' => $occurredAt,
        ];
    }
}
