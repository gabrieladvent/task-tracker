<?php

namespace App\Services;

use App\Models\Task;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Finds work that keeps getting pushed to tomorrow.
 *
 * A task that rolls over day after day looks perfectly normal on any single
 * day's board — it is always just "today's task". Only the chain reveals it
 * has been sliding for a fortnight, so this counts the versions per chain
 * rather than looking at individual rows.
 */
class StuckTaskService
{
    /** A chain counts as stuck once it has been carried over at least this many times. */
    public const DEFAULT_THRESHOLD = 3;

    private const CLOSED_STATUSES = ['done', 'cancelled'];

    public function stuckTasks(int $threshold = self::DEFAULT_THRESHOLD, int $limit = 8): array
    {
        $chains = $this->chainsPastThreshold($threshold);

        if ($chains->isEmpty()) {
            return $this->result([], $threshold);
        }

        $latestByRoot = $this->latestVersionsFor($chains->keys());

        $stuck = $chains
            ->map(function (array $chain, string $rootTaskId) use ($latestByRoot) {
                $task = $latestByRoot->get($rootTaskId);

                return $task === null ? null : $this->present($rootTaskId, $chain, $task);
            })
            ->filter()
            // Still open only: a chain that dragged for two weeks and then
            // landed is history, not a problem to act on.
            ->reject(fn (array $row) => in_array($row['status'], self::CLOSED_STATUSES, true))
            ->sortByDesc(fn (array $row) => [$row['carry_over_count'], $row['age_days']])
            ->take($limit)
            ->values()
            ->all();

        return $this->result($stuck, $threshold);
    }

    /**
     * One row per chain that has been copied more than the threshold, keyed by
     * chain root. Aggregated in the database so the dashboard never has to pull
     * every task into memory.
     *
     * @return Collection<string, array{version_count: int, first_task_date: string, last_task_date: string}>
     */
    private function chainsPastThreshold(int $threshold): Collection
    {
        return Task::query()
            // Aliased chain_id, not root_task_id: Task has a root_task_id
            // accessor, and accessors win over raw selected columns.
            ->selectRaw('COALESCE(parent_task_id, id) AS chain_id')
            ->selectRaw('COUNT(*) AS version_count')
            ->selectRaw('MIN(task_date) AS first_task_date')
            ->selectRaw('MAX(task_date) AS last_task_date')
            ->groupByRaw('COALESCE(parent_task_id, id)')
            ->havingRaw('COUNT(*) > ?', [$threshold])
            ->get()
            ->mapWithKeys(fn ($row) => [
                (string) $row->chain_id => [
                    'version_count' => (int) $row->version_count,
                    'first_task_date' => $row->first_task_date,
                    'last_task_date' => $row->last_task_date,
                ],
            ]);
    }

    /**
     * @return Collection<string, Task>
     */
    private function latestVersionsFor(Collection $rootIds): Collection
    {
        $tasks = Task::query()
            ->whereIn('id', $rootIds)
            ->orWhereIn('parent_task_id', $rootIds)
            ->with('project:id,name,color')
            ->get(['id', 'parent_task_id', 'period_id', 'project_id', 'title', 'status', 'priority', 'task_date', 'status_changed_at']);

        return Task::latestVersions($tasks)->keyBy(fn (Task $task) => $task->getOriginalTaskId());
    }

    private function present(string $rootTaskId, array $chain, Task $task): array
    {
        $today = Carbon::today();
        $startedOn = Carbon::parse($chain['first_task_date']);

        return [
            'root_task_id' => $rootTaskId,
            'task_id' => (string) $task->id,
            'period_id' => (string) $task->period_id,
            'title' => $task->title,
            'status' => $task->status->value,
            'priority' => $task->priority->value,
            'project' => $task->project ? [
                'id' => (string) $task->project->id,
                'name' => $task->project->name,
                'color' => $task->project->color,
            ] : null,
            'carry_over_count' => $chain['version_count'] - 1,
            'age_days' => (int) $startedOn->diffInDays($today),
            'first_task_date' => $startedOn->format('Y-m-d'),
            'last_task_date' => Carbon::parse($chain['last_task_date'])->format('Y-m-d'),
            'days_since_status_change' => $task->status_changed_at
                ? (int) $task->status_changed_at->copy()->startOfDay()->diffInDays($today)
                : null,
        ];
    }

    private function result(array $tasks, int $threshold): array
    {
        return [
            'threshold' => $threshold,
            'tasks' => $tasks,
        ];
    }
}
