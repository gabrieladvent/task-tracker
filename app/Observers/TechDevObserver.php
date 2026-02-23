<?php

namespace App\Observers;

use App\Models\TechDevTask;
use Illuminate\Support\Facades\Cache;

class TechDevObserver
{
    public function created(TechDevTask $techDev): void
    {
        Cache::forget('badge_count_tech_dev');
    }

    public function deleted(TechDevTask $techDev): void
    {
        Cache::forget('badge_count_tech_dev');
    }
}
