<?php

namespace App\Observers;

use App\Models\Period;
use Illuminate\Support\Facades\Cache;

class PeriodObserver
{
    public function created(Period $period): void
    {
        Cache::forget('badge_count_periods');
    }

    public function deleted(Period $period): void
    {
        Cache::forget('badge_count_periods');
    }

    public function restored(Period $period): void
    {
        Cache::forget('badge_count_periods');
    }
}
