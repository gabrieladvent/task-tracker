<?php

namespace App\Observers;

use App\Models\Project;
use Illuminate\Support\Facades\Cache;

class ProjectObserver
{
    public function created(Project $project): void
    {
        $this->flushCaches();
    }

    public function deleted(Project $project): void
    {
        $this->flushCaches();
    }

    public function restored(Project $project): void
    {
        $this->flushCaches();
    }

    private function flushCaches(): void
    {
        Cache::forget('badge_count_projects');
        Cache::forget('all_projects');
    }
}
