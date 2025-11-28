<?php

namespace App\Http\Controllers;

use App\Models\Period;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function store(Request $request, Period $period)
    {
        $validated = $request->validate([
            'task_date' => 'required|date',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:todo,in_progress,on_hold,code_review,done,cancelled',
            'priority' => 'nullable|in:low,medium,high',
            'story_points' => 'nullable|integer|min:0|max:100',
            'project_id' => 'nullable|exists:projects,id',
        ]);

        $task = $period->tasks()->create([
            'task_date' => $validated['task_date'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'todo',
            'priority' => $validated['priority'] ?? 'low',
            'story_points' => $validated['story_points'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'project_id' => $validated['project_id'],
        ]);

        return back();
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'task_date' => 'sometimes|required|date',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:todo,in_progress,on_hold,code_review,done,cancelled',
            'priority' => 'sometimes|in:low,medium,high',
            'story_points' => 'nullable|integer|min:0|max:100',
            'project_id' => 'nullable|exists:projects,id',
            'notes' => 'nullable|string',
        ]);

        $task->update($validated);

        return back();
    }

    public function destroy(Task $task)
    {
        $task->delete();

        return back();
    }
}
