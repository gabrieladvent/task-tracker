<?php

namespace App\Http\Controllers;

use App\Models\Period;
use App\Models\Project;
use App\Models\Task;
use App\Services\StuckTaskService;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(StuckTaskService $stuckTasks): \Inertia\Response
    {
        $today = Carbon::today();

        $todayStr = $today->format('Y-m-d');

        $currentPeriod = Period::with(['tasks' => function ($query) {
            $query->select('id', 'period_id', 'parent_task_id', 'project_id', 'status', 'task_date', 'created_at');
        }])
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->first();

        $periodStats = null;

        if ($currentPeriod) {

            $unique = Task::latestVersions($currentPeriod->tasks);

            $total = $unique->count();

            $done = $unique->where('status.value', 'done')->count();

            $carryOver = $unique->filter(fn ($task) => $task->parent_task_id !== null)->count();

            $totalDays = $currentPeriod->start_date->diffInDays($currentPeriod->end_date) + 1;

            $elapsedDays = $currentPeriod->start_date->diffInDays($today) + 1;

            $periodStats = [
                'id' => $currentPeriod->id,
                'name' => $currentPeriod->display_name,
                'start_date' => $currentPeriod->start_date->format('Y-m-d'),
                'end_date' => $currentPeriod->end_date->format('Y-m-d'),
                'total_tasks' => $total,
                'done_tasks' => $done,
                'carry_over' => $carryOver,
                'completion_pct' => $total > 0 ? round(($done / $total) * 100) : 0,
                'days_total' => $totalDays,
                'days_elapsed' => min($elapsedDays, $totalDays),
            ];
        }

        $todayTasks = Task::with('project:id,name')
            ->whereDate('task_date', $todayStr)
            ->select(['id', 'period_id', 'parent_task_id', 'project_id', 'title', 'status', 'priority', 'task_date', 'created_at'])
            ->orderBy('created_at')
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'title' => $t->title,
                'status' => $t->status->value,
                'priority' => $t->priority->value,
                'project_name' => $t->project?->name,
                'is_carry_over' => $t->parent_task_id !== null,
            ]);

        $pastPeriods = Period::with(['tasks:id,period_id,parent_task_id,status,task_date'])
            ->where('end_date', '<', $today)
            ->orderByDesc('start_date')
            ->limit(5)
            ->get()
            ->map(function ($period) {
                $unique = Task::latestVersions($period->tasks);

                $total = $unique->count();
                $done = $unique->where('status.value', 'done')->count();

                return [
                    'name' => $period->display_name,
                    'completion_pct' => $total > 0 ? round(($done / $total) * 100) : 0,
                    'total' => $total,
                    'done' => $done,
                ];
            })
            ->reverse()
            ->values();

        $projects = Project::select('id', 'name', 'color')->orderBy('name')->get();

        $allTasks = Task::latestVersions(
            Task::select('id', 'parent_task_id', 'project_id', 'status', 'task_date')->get()
        );

        $projectDistribution = [
            'period' => $this->distributeByProject(
                $currentPeriod ? Task::latestVersions($currentPeriod->tasks) : collect(),
                $projects
            ),
            'all' => $this->distributeByProject($allTasks, $projects),
        ];

        return Inertia::render('Home/Dashboard', [
            'currentPeriod' => $periodStats,
            'todayTasks' => $todayTasks,
            'pastPeriods' => $pastPeriods,
            'projectDistribution' => $projectDistribution,
            'stuckTasks' => $stuckTasks->stuckTasks(),
            'todayStr' => $todayStr,
        ]);
    }

    /**
     * Count how the given tasks spread across projects. Every project is kept so
     * an untouched project still shows up as a zero row, and tasks without a
     * project only get their own bucket when there actually are some.
     */
    private function distributeByProject(Collection $tasks, Collection $projects): array
    {
        $total = $tasks->count();

        $grouped = $tasks->groupBy(fn (Task $task) => $task->project_id ?? '');

        $rows = $projects
            ->map(fn ($project) => $this->distributionRow(
                $project->id,
                $project->name,
                $project->color ?: '#94A3B8',
                $grouped->get($project->id, collect()),
                $total
            ))
            ->all();

        $orphans = $grouped->get('', collect());

        if ($orphans->isNotEmpty()) {
            $rows[] = $this->distributionRow(null, 'No project', '#94A3B8', $orphans, $total);
        }

        usort($rows, fn ($a, $b) => $b['total'] <=> $a['total'] ?: strcmp($a['name'], $b['name']));

        return [
            'total' => $total,
            'rows' => $rows,
        ];
    }

    private function distributionRow(?string $id, string $name, string $color, Collection $tasks, int $total): array
    {
        $count = $tasks->count();

        return [
            'id' => $id,
            'name' => $name,
            'color' => $color,
            'total' => $count,
            'done' => $tasks->where('status.value', 'done')->count(),
            'share_pct' => $total > 0 ? round(($count / $total) * 100, 1) : 0,
        ];
    }
}
