<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\TechDevTask;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TechDevTaskController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 12);
        $search = $request->input('search', '');

        $tasks = TechDevTask::with('project')
            ->when($search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('TechDev/Index', [
            'tasks' => $tasks,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
            'projects' => Project::select('id', 'name', 'color')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        TechDevTask::create($validated);

        return back();
    }

    public function update(Request $request, TechDevTask $techDevTask)
    {
        $validated = $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $techDevTask->update($validated);

        return back();
    }

    public function destroy(TechDevTask $techDevTask)
    {
        $techDevTask->delete();

        return back();
    }

    public function moveToTask(Request $request, TechDevTask $techDevTask)
    {
        $validated = $request->validate([
            'task_date' => 'required|date',
            'status' => 'nullable|in:todo,in_progress,on_hold,code_review,done,cancelled',
            'priority' => 'nullable|in:low,medium,high',
            'story_points' => 'nullable|integer|min:0|max:100',
        ]);

        // protected $fillable = [
        //     'name',
        //     'start_date',
        //     'end_date',
        // ];

        $period = \App\Models\Period::current()->first();

        $task = \App\Models\Task::create([
            'period_id' => $period->id,
            'task_date' => $validated['task_date'],
            'title' => $techDevTask->title,
            'description' => $techDevTask->description,
            'notes' => $techDevTask->notes,
            'project_id' => $techDevTask->project_id,
            'status' => $validated['status'] ?? 'todo',
            'priority' => $validated['priority'] ?? 'medium',
            'story_points' => $validated['story_points'] ?? null,
        ]);

        $techDevTask->delete();

        return back()->with('success', 'Task moved successfully');
    }
}
