<?php

namespace App\Observers;

use App\Models\PeriodReport;
use Illuminate\Support\Facades\Cache;

class ReportObserver
{
    public function created(PeriodReport $periodeReport): void
    {
        Cache::forget('badge_count_reports');
    }

    public function deleted(PeriodReport $periodeReport): void
    {
        Cache::forget('badge_count_reports');
    }
}
