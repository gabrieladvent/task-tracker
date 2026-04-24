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

        $this->info("Extending incomplete tasks from {$fromDate->format('Y-m-d')} to {$targetDate->format('Y-m-d')}");

        $targetPeriod = Period::whereDate('start_date', '<=', $targetDate)
            ->whereDate('end_date', '>=', $targetDate)
            ->first();

        if (! $targetPeriod) {
            $this->error("No period found for target date {$targetDate->format('Y-m-d')}");

            return Command::FAILURE;
        }

        $this->info("Target period: {$targetPeriod->name}");

        $incompleteTasks = Task::activeOnDate($fromDate->format('Y-m-d'))
            ->whereNotIn('status', ['done', 'cancelled', 'on_hold'])
            ->get();

        if ($incompleteTasks->isEmpty()) {
            $this->info('No incomplete tasks found.');

            return Command::SUCCESS;
        }

        $updatedCount = 0;

        foreach ($incompleteTasks as $task) {
            $task->update([
                'end_date' => $targetDate->format('Y-m-d'),
                'period_id' => $targetPeriod->id,
            ]);

            $updatedCount++;

            $this->info("Extended: {$task->title}");
        }

        $this->info("Successfully extended {$updatedCount} task(s) to {$targetDate->format('Y-m-d')}.");

        return Command::SUCCESS;
    }
}
