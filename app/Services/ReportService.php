<?php

namespace App\Services;

use App\Enum\PriorityEnum;
use App\Enum\StatusEnum;
use App\Models\Period;
use App\Models\PeriodReport;
use Carbon\Carbon;

class ReportService
{
    public function generateReport(Period $period, string $reportName): PeriodReport
    {
        $reportData = $this->prepareReportData($period);

        $totalTasks = 0;

        $completedTasks = 0;

        $totalStoryPoints = 0;

        foreach ($reportData as $projectTasks) {
            $totalTasks += count($projectTasks);

            foreach ($projectTasks as $task) {
                if (isset($task['status']) && $task['status'] === 'done') {
                    $completedTasks++;
                }

                $totalStoryPoints += $task['story_point'] ?? 0;
            }
        }

        $report = PeriodReport::create([
            'period_id' => $period->id,
            'report_name' => $reportName,
            'report_data' => $reportData,
            'total_tasks' => $totalTasks,
            'completed_tasks' => $completedTasks,
            'total_story_points' => $totalStoryPoints,
        ]);

        return $report;
    }

    protected function prepareReportData(Period $period): array
    {
        $tasks = $period->tasks()
            ->with('project:id,name')
            ->orderBy('task_date')
            ->orderBy('created_at')
            ->get();

        $groupedByProject = $tasks->groupBy(function ($task) {
            return $task->project ? $task->project->name : 'No Project';
        });

        $reportData = [];

        foreach ($groupedByProject as $projectName => $projectTasks) {
            $mergedTasks = $this->mergeRecurringTasks($projectTasks, $period);

            $reportData[$projectName] = $mergedTasks;
        }

        return $reportData;
    }

    protected function mergeRecurringTasks($tasks, $period): array
    {
        $grouped = [];

        foreach ($tasks as $task) {
            $key = $task->title.'|'.($task->project_id ?? 'null');

            if (! isset($grouped[$key])) {
                $grouped[$key] = [
                    'title' => $task->title,
                    'project_id' => $task->project_id,
                    'project_name' => $task->project?->name,
                    'description' => $task->description,
                    'priority' => $task->priority,
                    'story_points' => $task->story_points ?? 0,
                    'first_date' => $task->task_date,
                    'last_date' => $task->task_date,
                    'latest_status' => $task->status,
                    'latest_updated' => $task->updated_at,
                    'all_dates' => [$task->task_date->format('Y-m-d')],
                ];
            } else {
                if ($task->task_date->gt($grouped[$key]['last_date'])) {
                    $grouped[$key]['last_date'] = $task->task_date;
                }

                if ($task->updated_at->gt($grouped[$key]['latest_updated'])) {
                    $grouped[$key]['latest_status'] = $task->status;
                    $grouped[$key]['latest_updated'] = $task->updated_at;

                    if ($task->story_points !== null) {
                        $grouped[$key]['story_points'] = $task->story_points;
                    }
                }

                $grouped[$key]['all_dates'][] = $task->task_date->format('Y-m-d');
            }
        }

        $result = [];
        foreach ($grouped as $taskData) {
            $priority = $taskData['priority'];

            $priorityValue = $priority instanceof PriorityEnum ? $priority->value : $priority;

            $status = $taskData['latest_status'];

            $statusValue = $status instanceof StatusEnum ? $status->value : $status;

            $result[] = [
                'priority' => $priorityValue,
                'fitur' => $taskData['project_name'] ?? '-',
                'title' => $taskData['title'],
                'description' => $taskData['description'] ?? '-',
                'step' => '-',
                'acceptance_criteria' => '-',
                'definition_of_done' => '-',
                'status' => $statusValue,
                'target_selesai' => '-',
                'start_date' => $taskData['first_date']->format('Y-m-d'),
                'end_date' => $taskData['last_date']->format('Y-m-d'),
                'developer' => '-',
                'story_point' => $taskData['story_points'],
                'delivery_tepat_waktu' => $this->checkDeliveryStatus($taskData, $period),
                'temuan_bug' => '-',
            ];
        }

        return $result;
    }

    protected function checkDeliveryStatus($taskData, $period): string
    {
        $status = $taskData['latest_status'];

        $statusValue = $status instanceof StatusEnum ? $status->value : $status;

        if ($statusValue !== 'done') {
            return '-';
        }

        $endDate = Carbon::parse($taskData['last_date']);

        $periodEnd = $period->end_date;

        return $endDate->lte($periodEnd) ? 'Yes' : 'No';
    }
}
