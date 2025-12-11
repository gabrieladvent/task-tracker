<?php

namespace App\Exports;

use App\Models\PeriodReport;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PeriodReportExport implements WithMultipleSheets
{
    protected $report;

    public function __construct(PeriodReport $report)
    {
        $this->report = $report;
    }

    public function sheets(): array
    {
        $sheets = [];

        $reportData = $this->report->report_data;

        foreach ($reportData as $section => $tasks) {
            $sheets[] = new PeriodReportSheet($section, $tasks, $this->report);
        }

        return $sheets;
    }
}

class PeriodReportSheet implements FromCollection, WithHeadings, WithStyles, WithTitle
{
    protected $section;

    protected $tasks;

    protected $report;

    public function __construct($section, $tasks, $report)
    {
        $this->section = $section;
        $this->tasks = $tasks;
        $this->report = $report;
    }

    public function collection()
    {
        $collection = collect();

        foreach ($this->tasks as $index => $task) {
            $collection->push([
                'no' => $index + 1,
                'priority' => ucfirst($task['priority'] ?? '-'),
                'fitur' => $task['fitur'] ?? '-',
                'title' => $task['title'] ?? '-',
                'description' => $task['description'] ?? '-',
                'step' => $task['step'] ?? '-',
                'acceptance_criteria' => $task['acceptance_criteria'] ?? '-',
                'definition_of_done' => $task['definition_of_done'] ?? '-',
                'status' => ucfirst($task['status'] ?? '-'),
                'target_selesai' => $task['target_selesai'] ?? '-',
                'start_date' => $task['start_date'] ?? '-',
                'end_date' => $task['end_date'] ?? '-',
                'developer' => $task['developer'] ?? '-',
                'story_point' => $task['story_point'] ?? 0,
                'delivery_tepat_waktu' => $task['delivery_tepat_waktu'] ?? '-',
                'temuan_bug' => $task['temuan_bug'] ?? '-',
            ]);
        }

        // Add total row
        $totalStoryPoints = collect($this->tasks)->sum('story_point');
        $collection->push([
            'no' => '',
            'priority' => '',
            'fitur' => '',
            'title' => '',
            'description' => '',
            'step' => '',
            'acceptance_criteria' => '',
            'definition_of_done' => '',
            'status' => '',
            'target_selesai' => '',
            'start_date' => '',
            'end_date' => '',
            'developer' => 'Total',
            'story_point' => $totalStoryPoints,
            'delivery_tepat_waktu' => '',
            'temuan_bug' => '',
        ]);

        return $collection;
    }

    public function headings(): array
    {
        return [
            'No',
            'Priority',
            'Fitur',
            'Title Task',
            'Description',
            'Step / Langkah',
            'Acceptance Criteria',
            'Definition of Done',
            'Status',
            'Target Selesai',
            'Start Date',
            'End Date',
            'Developer',
            'Story Point',
            'Delivery Tepat Waktu',
            'Temuan Bug',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true], 'fill' => ['fillType' => 'solid', 'color' => ['rgb' => 'E2E8F0']]],
        ];
    }

    public function title(): string
    {
        return substr($this->section, 0, 31); // Excel sheet name max 31 chars
    }
}
