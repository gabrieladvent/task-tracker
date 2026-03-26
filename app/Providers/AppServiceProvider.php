<?php

namespace App\Providers;

use App\Models\Period;
use App\Models\PeriodReport;
use App\Models\Project;
use App\Models\TechDevTask;
use App\Observers\PeriodObserver;
use App\Observers\ProjectObserver;
use App\Observers\ReportObserver;
use App\Observers\TechDevObserver;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Period::observe(PeriodObserver::class);
        Project::observe(ProjectObserver::class);
        PeriodReport::observe(ReportObserver::class);
        TechDevTask::observe(TechDevObserver::class);
    }
}
