<?php

namespace App\Http\Controllers;

use App\Exports\PeriodReportExport;
use App\Models\Period;
use App\Models\PeriodReport;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class PeriodReportController extends Controller
{
    public function __construct(
        private ReportService $reportService
    ) {}

    public function indexAll(Request $request)
    {
        $search = $request->input('search', '');

        $perPage = $request->input('per_page', 10);

        $reports = PeriodReport::with('period:id,name,start_date,end_date')
            ->when($search, function ($query, $search) {
                $query->where('report_name', 'like', "%{$search}%")
                    ->orWhereHas('period', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Reports/IndexAll', [
            'reports' => $reports->through(fn ($report) => [
                'id' => $report->id,
                'report_name' => $report->report_name,
                'period' => [
                    'id' => $report->period->id,
                    'name' => $report->period->display_name,
                    'start_date' => $report->period->start_date->format('Y-m-d'),
                    'end_date' => $report->period->end_date->format('Y-m-d'),
                ],
                'total_tasks' => $report->total_tasks,
                'completed_tasks' => $report->completed_tasks,
                'total_story_points' => $report->total_story_points,
                'created_at' => $report->created_at->format('d M Y H:i'),
            ]),
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function index(Period $period, Request $request)
    {
        $search = $request->input('search', '');

        $perPage = $request->input('per_page', 10);

        $reports = PeriodReport::where('period_id', $period->id)
            ->when($search, function ($query, $search) {
                $query->where('report_name', 'like', "%{$search}%");
            })
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Reports/Index', [
            'period' => [
                'id' => $period->id,
                'name' => $period->display_name,
                'start_date' => $period->start_date->format('Y-m-d'),
                'end_date' => $period->end_date->format('Y-m-d'),
            ],
            'reports' => $reports->through(fn ($report) => [
                'id' => $report->id,
                'report_name' => $report->report_name,
                'total_tasks' => $report->total_tasks,
                'completed_tasks' => $report->completed_tasks,
                'total_story_points' => $report->total_story_points,
                'created_at' => $report->created_at->format('d M Y H:i'),
            ]),
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request, Period $period)
    {
        $validated = $request->validate([
            'report_name' => 'required|string|max:255',
        ]);

        $report = $this->reportService->generateReport($period, $validated['report_name']);

        return redirect()
            ->route('periods.reports.show', ['period' => $period->id, 'report' => $report->id])
            ->with('success', 'Report generated successfully');
    }

    public function show(Period $period, PeriodReport $report)
    {
        return Inertia::render('Reports/Show', [
            'period' => [
                'id' => $period->id,
                'name' => $period->display_name,
                'start_date' => $period->start_date->format('Y-m-d'),
                'end_date' => $period->end_date->format('Y-m-d'),
            ],
            'report' => [
                'id' => $report->id,
                'report_name' => $report->report_name,
                'total_tasks' => $report->total_tasks,
                'completed_tasks' => $report->completed_tasks,
                'total_story_points' => $report->total_story_points,
                'report_data' => $report->report_data,
                'created_at' => $report->created_at->format('d M Y H:i'),
            ],
        ]);
    }

    public function export(Period $period, PeriodReport $report)
    {
        $cleanReportName = str_replace(['/', '\\', ':', '*', '?', '"', '<', '>', '|'], '_', $report->report_name);

        $fileName = sprintf(
            '%s_%s.xlsx',
            str_replace(' ', '_', $cleanReportName),
            now()->format('YmdHis')
        );

        return Excel::download(
            new PeriodReportExport($report),
            $fileName
        );
    }

    public function destroy(Period $period, PeriodReport $report)
    {
        $report->delete();

        return redirect()
            ->route('periods.reports.index', $period->id)
            ->with('success', 'Report deleted successfully');
    }
}
