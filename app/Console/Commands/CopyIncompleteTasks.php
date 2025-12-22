<?php

namespace App\Console\Commands;

use App\Models\Period;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CopyIncompleteTasks extends Command
{
    protected $signature = 'tasks:copy-incomplete
                            {--date= : The date to copy tasks to (default: today)}
                            {--from-date= : The date to copy tasks from (default: yesterday)}';

    protected $description = 'Copy incomplete tasks from previous day to specified date (supports cross-period copying)';

    public function handle()
    {
        $targetDate = $this->option('date')
            ? Carbon::parse($this->option('date'))
            : Carbon::today();

        $fromDate = $this->option('from-date')
            ? Carbon::parse($this->option('from-date'))
            : Carbon::yesterday();

        $this->info("Copying incomplete tasks from {$fromDate->format('Y-m-d')} to {$targetDate->format('Y-m-d')}");

        $targetPeriod = Period::whereDate('start_date', '<=', $targetDate)
            ->whereDate('end_date', '>=', $targetDate)
            ->first();

        if (! $targetPeriod) {
            $this->error("No period found for target date {$targetDate->format('Y-m-d')}");

            return Command::FAILURE;
        }

        $this->info("Target period: {$targetPeriod->name} ({$targetPeriod->start_date} to {$targetPeriod->end_date})");

        $incompleteTasks = Task::whereDate('task_date', $fromDate->format('Y-m-d'))
            ->whereNotIn('status', ['done', 'cancelled', 'on_hold'])
            ->get();

        if ($incompleteTasks->isEmpty()) {
            $this->info('No incomplete tasks found.');

            return Command::SUCCESS;
        }

        $copiedCount = 0;

        foreach ($incompleteTasks as $task) {
            $existingTask = Task::whereDate('task_date', $targetDate->format('Y-m-d'))
                ->where('title', $task->title)
                ->where('period_id', $targetPeriod->id)
                ->first();

            if ($existingTask) {
                $this->warn("Task '{$task->title}' already exists for {$targetDate->format('Y-m-d')}. Skipping.");

                continue;
            }

            Task::create([
                'period_id' => $targetPeriod->id,
                'project_id' => $task->project_id,
                'task_date' => $targetDate->format('Y-m-d'),
                'title' => $task->title,
                'description' => $task->description,
                'status' => $task->status,
                'priority' => $task->priority,
                'story_points' => $task->story_points,
                'notes' => $task->notes,
                'link_pull_request' => $task->link_pull_request,
            ]);

            $copiedCount++;
            $this->info("Copied: {$task->title}");
        }

        $this->info("Successfully copied {$copiedCount} task(s) to period '{$targetPeriod->name}'.");

        return Command::SUCCESS;
    }
}
