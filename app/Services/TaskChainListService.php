<?php

namespace App\Services;

use App\Models\Task;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Facades\DB;

/**
 * Every task ever filed, one row per carry-over chain.
 *
 * tasks:copy-incomplete clones an unfinished task into each new day, so the
 * raw table holds the same piece of work many times over. This list shows
 * only the newest copy of each chain — the one that reflects where the work
 * stands now — and carries the chain's size alongside it.
 *
 * The dedupe happens in SQL rather than through Task::latestVersions() so
 * that pagination counts chains, not rows.
 */
class TaskChainListService
{
    private const CHAIN_KEY = 'COALESCE(parent_task_id, id)';

    public function paginate(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = Task::query()
            ->select('tasks.*')
            ->addSelect('chains.chain_id', 'chains.version_count', 'chains.first_task_date')
            ->joinSub($this->chainStats(), 'chains', fn ($join) => $join->on(
                'chains.chain_id', '=', DB::raw('COALESCE(tasks.parent_task_id, tasks.id)')
            ))
            ->whereNotExists(fn (QueryBuilder $newer) => $this->newerVersionOf($newer))
            ->with([
                'project:id,name,color',
                'period' => fn ($q) => $q->withTrashed()->select('id', 'name', 'start_date', 'end_date'),
            ])
            ->orderByDesc('tasks.task_date')
            ->orderByDesc('tasks.created_at');

        $this->applyFilters($query, $filters);

        return $query
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Task $task) => $this->present($task));
    }

    /**
     * Version count and start date per chain, over live rows only — a deleted
     * copy is no longer part of the story the list tells.
     */
    private function chainStats(): QueryBuilder
    {
        return DB::table('tasks')
            ->whereNull('deleted_at')
            ->selectRaw(self::CHAIN_KEY.' AS chain_id')
            ->selectRaw('COUNT(*) AS version_count')
            ->selectRaw('MIN(task_date) AS first_task_date')
            ->groupByRaw(self::CHAIN_KEY);
    }

    /**
     * A row survives only when no live sibling in its chain is newer. Ties on
     * date fall back to created_at and then id, so exactly one row per chain
     * is kept even when two copies landed on the same day.
     */
    private function newerVersionOf(QueryBuilder $newer): void
    {
        $newer->from('tasks', 'newer')
            ->whereNull('newer.deleted_at')
            ->whereRaw('COALESCE(newer.parent_task_id, newer.id) = COALESCE(tasks.parent_task_id, tasks.id)')
            ->where(fn ($q) => $q
                ->whereColumn('newer.task_date', '>', 'tasks.task_date')
                ->orWhere(fn ($q) => $q
                    ->whereColumn('newer.task_date', 'tasks.task_date')
                    ->whereColumn('newer.created_at', '>', 'tasks.created_at'))
                ->orWhere(fn ($q) => $q
                    ->whereColumn('newer.task_date', 'tasks.task_date')
                    ->whereColumn('newer.created_at', 'tasks.created_at')
                    ->whereColumn('newer.id', '>', 'tasks.id')));
    }

    private function applyFilters(Builder $query, array $filters): void
    {
        if (! empty($filters['search'])) {
            $query->where('tasks.title', 'like', '%'.$filters['search'].'%');
        }

        if (! empty($filters['status'])) {
            $query->where('tasks.status', $filters['status']);
        }

        if (! empty($filters['project_id'])) {
            $query->where('tasks.project_id', $filters['project_id']);
        }
    }

    private function present(Task $task): array
    {
        $versionCount = (int) $task->version_count;

        return [
            'id' => (string) $task->id,
            'root_task_id' => (string) $task->chain_id,
            'period_id' => (string) $task->period_id,
            'period_name' => $task->period?->display_name,
            'title' => $task->title,
            'description' => $task->description,
            'notes' => $task->notes,
            'status' => $task->status->value,
            'priority' => $task->priority->value,
            'story_points' => $task->story_points,
            'project' => $task->project?->name,
            'project_id' => $task->project_id ? (string) $task->project_id : null,
            'project_color' => $task->project?->color,
            'link_pull_request' => $task->link_pull_request,
            'task_date' => $task->task_date->format('Y-m-d'),
            'first_task_date' => substr((string) $task->first_task_date, 0, 10),
            'version_count' => $versionCount,
            'carry_over_count' => max(0, $versionCount - 1),
        ];
    }
}
