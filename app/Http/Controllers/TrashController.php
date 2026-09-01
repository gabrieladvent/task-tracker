<?php

namespace App\Http\Controllers;

use App\Models\Period;
use App\Models\PeriodReport;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * One place to see and undo everything soft deleted.
 *
 * Permanent deletion is the last remaining path where the cascades still bite,
 * so every entry carries what a force delete would take with it — the point of
 * this screen is that the choice is informed rather than silent.
 */
class TrashController extends Controller
{
    private const MODELS = [
        'tasks' => Task::class,
        'projects' => Project::class,
        'periods' => Period::class,
    ];

    public function index(): Response
    {
        return Inertia::render('Trash/Index', [
            'tasks' => $this->trashedTasks(),
            'projects' => $this->trashedProjects(),
            'periods' => $this->trashedPeriods(),
        ]);
    }

    public function restore(string $type, string $id): RedirectResponse
    {
        $this->resolve($type, $id)->restore();

        return back()->with('success', Str::singular(ucfirst($type)).' restored.');
    }

    public function forceDestroy(string $type, string $id): RedirectResponse
    {
        $this->resolve($type, $id)->forceDelete();

        return back()->with('success', Str::singular(ucfirst($type)).' permanently deleted.');
    }

    private function resolve(string $type, string $id): Model
    {
        abort_unless(array_key_exists($type, self::MODELS), 404);

        return self::MODELS[$type]::onlyTrashed()->findOrFail($id);
    }

    private function trashedTasks(): array
    {
        return Task::onlyTrashed()
            ->with('project:id,name,color')
            ->orderByDesc('deleted_at')
            ->get()
            ->map(fn (Task $task) => [
                'id' => (string) $task->id,
                'title' => $task->title,
                'subtitle' => $task->task_date?->format('d M Y'),
                'meta' => array_values(array_filter([
                    $task->status->label(),
                    $task->project?->name,
                ])),
                'deleted_at' => $task->deleted_at?->toIso8601String(),
                // Only a chain root cascades, and it reaches copies that are
                // still very much alive.
                'cascade' => $this->describeCascade([
                    'carry-over copies' => $task->parent_task_id === null
                        ? Task::withTrashed()->where('parent_task_id', $task->id)->count()
                        : 0,
                ]),
            ])
            ->all();
    }

    private function trashedProjects(): array
    {
        return Project::onlyTrashed()
            ->orderByDesc('deleted_at')
            ->get()
            ->map(fn (Project $project) => [
                'id' => (string) $project->id,
                'title' => $project->name,
                'subtitle' => $project->description,
                'meta' => [],
                'color' => $project->color,
                'deleted_at' => $project->deleted_at?->toIso8601String(),
                'cascade' => $this->describeCascade([
                    'tasks' => Task::withTrashed()->where('project_id', $project->id)->count(),
                ]),
            ])
            ->all();
    }

    private function trashedPeriods(): array
    {
        return Period::onlyTrashed()
            ->orderByDesc('deleted_at')
            ->get()
            ->map(fn (Period $period) => [
                'id' => (string) $period->id,
                'title' => $period->display_name,
                'subtitle' => $period->start_date->format('d M Y').' – '.$period->end_date->format('d M Y'),
                'meta' => [],
                'deleted_at' => $period->deleted_at?->toIso8601String(),
                'cascade' => $this->describeCascade([
                    'tasks' => Task::withTrashed()->where('period_id', $period->id)->count(),
                    'reports' => PeriodReport::where('period_id', $period->id)->count(),
                ]),
            ])
            ->all();
    }

    /**
     * @param  array<string, int>  $counts
     * @return list<string>
     */
    private function describeCascade(array $counts): array
    {
        return collect($counts)
            ->filter()
            ->map(fn (int $count, string $label) => $count.' '.Str::plural(Str::singular($label), $count))
            ->values()
            ->all();
    }
}
