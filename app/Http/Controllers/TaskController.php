<?php

namespace App\Http\Controllers;

use App\Models\Period;
use App\Models\Task;
use App\Services\TaskActivityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class TaskController extends Controller
{
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
