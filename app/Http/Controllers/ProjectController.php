<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');

        $projects = Project::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Project/Index', [
            'projects' => $projects,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:7',
        ]);

        Project::create($validated);

        Cache::forget('all_projects');

        return redirect()->route('projects.index');
    }

    public function show(Project $project)
    {
        //
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:7',
        ]);

        $project->update($validated);

        Cache::forget('all_projects');

        return redirect()->route('projects.index');
    }

    public function destroy(Project $project)
    {
        $project->delete();

        Cache::forget('all_projects');

        return redirect()->route('projects.index');
    }

    public function getAllProject()
    {
        $projects = Cache::remember('all_projects', 3600, function () {
            return Project::select('id', 'name')->orderBy('name')->get();
        });

        return response()->json($projects);
    }
}
