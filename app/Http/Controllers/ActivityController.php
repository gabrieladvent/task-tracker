<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\ActivityDigestService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    private const PRESETS = ['today', 'yesterday', 'week', 'month', 'custom'];

    public function __construct(
        private ActivityDigestService $digest
    ) {}

    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'preset' => ['nullable', Rule::in(self::PRESETS)],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'project_id' => ['nullable', 'exists:projects,id'],
        ]);

        [$preset, $from, $to] = $this->resolveRange($validated);

        $projectId = $validated['project_id'] ?? null;

        return Inertia::render('Activity/Index', [
            'digest' => $this->digest->digest($from, $to, $projectId),
            'projects' => Project::orderBy('name')->get(['id', 'name', 'color']),
            'filters' => [
                'preset' => $preset,
                'from' => $from->format('Y-m-d'),
                'to' => $to->format('Y-m-d'),
                'project_id' => $projectId,
            ],
        ]);
    }

    /**
     * An explicit from/to always wins and switches the view to a custom range;
     * otherwise the named preset decides, defaulting to the last seven days.
     *
     * @return array{0: string, 1: Carbon, 2: Carbon}
     */
    private function resolveRange(array $validated): array
    {
        $today = Carbon::today();

        if (isset($validated['from']) || isset($validated['to'])) {
            return [
                'custom',
                isset($validated['from']) ? Carbon::parse($validated['from']) : $today->copy()->subDays(6),
                isset($validated['to']) ? Carbon::parse($validated['to']) : $today->copy(),
            ];
        }

        $preset = $validated['preset'] ?? 'week';

        return match ($preset) {
            'today' => [$preset, $today->copy(), $today->copy()],
            'yesterday' => [$preset, $today->copy()->subDay(), $today->copy()->subDay()],
            'month' => [$preset, $today->copy()->subDays(29), $today->copy()],
            default => ['week', $today->copy()->subDays(6), $today->copy()],
        };
    }
}
