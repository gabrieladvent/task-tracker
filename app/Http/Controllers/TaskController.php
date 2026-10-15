<?php

namespace App\Http\Controllers;

use App\Enum\StatusEnum;
use App\Models\Period;
use App\Models\Project;
use App\Models\Task;
use App\Services\TaskActivityService;
use App\Services\TaskChainListService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    private const PER_PAGE_OPTIONS = [10, 25, 50, 100];

    /**
     * Every task across all periods, one row per carry-over chain.
     */
    public function index(Request $request, TaskChainListService $chains): Response
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::enum(StatusEnum::class)],
            'project_id' => ['nullable', 'exists:projects,id'],
            'per_page' => ['nullable', 'integer', Rule::in(self::PER_PAGE_OPTIONS)],
        ]);

        $perPage = (int) ($validated['per_page'] ?? 25);

        return Inertia::render('Periods/AllTasks', [
            'tasks' => $chains->paginate($validated, $perPage),
            'projects' => Project::orderBy('name')->get(['id', 'name', 'color']),
            'filters' => [
                'search' => $validated['search'] ?? '',
                'status' => $validated['status'] ?? null,
                'project_id' => $validated['project_id'] ?? null,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request, Period $period)
    {
        $validated = $request->validate([
            'task_date' => 'required|date',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:todo,in_progress,on_hold,code_review,ready_qa,ready_dev,done,cancelled',
            'priority' => 'nullable|in:low,medium,high,critical',
            'story_points' => 'nullable|integer|min:0|max:100',
            'project_id' => 'nullable|exists:projects,id',
            'notes' => 'nullable|string',
            'link_pull_request' => 'nullable|string',
        ]);

        $task = $period->tasks()->create([
            'task_date' => $validated['task_date'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'todo',
            'priority' => $validated['priority'] ?? 'low',
            'story_points' => $validated['story_points'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'project_id' => $validated['project_id'] ?? null,
            'link_pull_request' => $validated['link_pull_request'] ?? null,
        ]);

        return back()->with('newTaskId', $task->id);
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'task_date' => 'sometimes|required|date',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:todo,in_progress,on_hold,code_review,ready_qa,ready_dev,done,cancelled',
            'priority' => 'sometimes|in:low,medium,high,critical',
            'story_points' => 'nullable|integer|min:0|max:100',
            'project_id' => 'nullable|exists:projects,id',
            'notes' => 'nullable|string',
            'link_pull_request' => 'nullable|string',
        ]);

        if (isset($validated['status']) && $validated['status'] !== $task->status->value) {
            $validated['status_changed_at'] = now();
        }

        $task->update($validated);

        return back();
    }

    public function activities(Task $task, TaskActivityService $activities): JsonResponse
    {
        return response()->json($activities->timelineFor($task));
    }

    public function destroy(Task $task)
    {
        $task->delete();

        return back();
    }

    public function generateTasks(Request $request, Period $period)
    {
        if (! app()->isLocal()) {
            abort(403, 'This feature is only available in development.');
        }

        $params = [];

        if ($request->filled('from_date')) {
            $params['--from-date'] = $request->from_date;
        }

        if ($request->filled('to_date')) {
            $params['--date'] = $request->to_date;
        }

        Artisan::call('tasks:copy-incomplete', $params);

        return back()->with('success', 'Tasks generated successfully.');
    }
}
