<?php

namespace App\Exports;

use App\Enum\TaskActivityTypeEnum;
use App\Enum\TaskFieldEnum;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Flattens the day -> task -> event digest into one row per change, which is
 * the shape a spreadsheet can actually filter and pivot on.
 */
class ActivityDigestExport implements FromCollection, WithHeadings, WithStyles, WithTitle
{
    public function __construct(
        private array $digest,
        private string $from,
        private string $to,
    ) {}

    public function collection(): Collection
    {
        $rows = collect();

        foreach ($this->digest['days'] as $day) {
            foreach ($day['tasks'] as $task) {
                foreach ($task['activities'] as $activity) {
                    $rows->push([
                        'date' => $day['formatted_date'],
                        'day' => $day['day_name'],
                        'time' => Carbon::parse($activity['occurred_at'])->format('H:i'),
                        'task' => $task['title'],
                        'project' => $task['project']['name'] ?? '-',
                        'current_status' => $this->humanize($task['status']),
                        'change' => $activity['label'],
                        'detail' => $this->describe($activity),
                    ]);
                }
            }
        }

        return $rows;
    }

    public function headings(): array
    {
        return [
            'Date',
            'Day',
            'Time',
            'Task',
            'Project',
            'Current Status',
            'Change',
            'Detail',
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
        return substr("Activity {$this->from} to {$this->to}", 0, 31);
    }

    private function describe(array $activity): string
    {
        $from = $this->flatten($activity['from']);
        $to = $this->flatten($activity['to']);

        return match ($activity['type']) {
            TaskActivityTypeEnum::STATUS_CHANGED->value => trim(sprintf(
                '%s → %s',
                $this->humanize($from) ?: '-',
                $this->humanize($to) ?: '-'
            )),
            TaskActivityTypeEnum::CARRIED_OVER->value => $from === ''
                ? $to
                : "{$from} → {$to}",
            TaskActivityTypeEnum::FIELD_CHANGED->value => $this->describeFieldChange($activity, $from, $to),
            TaskActivityTypeEnum::PR_LINKED->value => $to === '' ? 'removed' : $to,
            TaskActivityTypeEnum::CREATED->value => $this->humanize($this->flatten($activity['to']['status'] ?? null)),
            default => '',
        };
    }

    private function describeFieldChange(array $activity, string $from, string $to): string
    {
        $field = $activity['field_label'] ?? TaskFieldEnum::labelFor($activity['field']) ?? '';

        if ($activity['field_is_opaque'] ?? TaskFieldEnum::isOpaqueField($activity['field'])) {
            return $field;
        }

        return trim("{$field}: ".($from ?: '-').' → '.($to ?: '-'));
    }

    /**
     * from/to are json, so they can be a scalar, null, or a small map.
     */
    private function flatten(mixed $value): string
    {
        if ($value === null) {
            return '';
        }

        if (is_array($value)) {
            return collect($value)
                ->map(fn ($item, $key) => "{$key}: {$item}")
                ->implode(', ');
        }

        return (string) $value;
    }

    private function humanize(?string $value): string
    {
        return $value === null || $value === ''
            ? ''
            : ucwords(str_replace('_', ' ', $value));
    }
}
