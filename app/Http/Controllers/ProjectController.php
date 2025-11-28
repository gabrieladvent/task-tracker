<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function store(Request $request)
    {
        Project::create([
            'name' => $request->get('name'),
            'description' => $request->get('description'),
            'color' => $request->get('color'),
        ]);

        return back();
    }
}
