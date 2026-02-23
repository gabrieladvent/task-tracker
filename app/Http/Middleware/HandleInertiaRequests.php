<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'badges' => $request->user() ? [
                'periods' => cache()->remember(
                    'badge_count_periods',
                    now()->addMinutes(10),
                    fn () => \App\Models\Period::count()
                ),
                'projects' => cache()->remember(
                    'badge_count_projects',
                    now()->addMinutes(10),
                    fn () => \App\Models\Project::count()
                ),
                'reports' => cache()->remember(
                    'badge_count_reports',
                    now()->addMinutes(10),
                    fn () => \App\Models\PeriodReport::count()
                ),
                'techDev' => cache()->remember(
                    'badge_count_tech_dev',
                    now()->addMinutes(10),
                    fn () => \App\Models\TechDevTask::count()
                ),
            ] : [],
        ];
    }
}
