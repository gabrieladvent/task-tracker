<?php

namespace App\Observers;

use App\Models\Project;
use Illuminate\Support\Facades\Cache;

class ProjectObserver
{
    public function created(Project $project): void
    {
        Cache::forget('badge_count_projects');
    }

    public function deleted(Project $project): void
    {
        Cache::forget('badge_count_projects');
    }
}
