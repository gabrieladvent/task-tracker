<?php

namespace App\Models;

use App\Enum\TaskActivityTypeEnum;
use App\Enum\TaskFieldEnum;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskActivity extends Model
{
    use HasFactory;
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'root_task_id',
        'task_id',
        'type',
        'field',
        'from_value',
        'to_value',
        'task_date',
        'occurred_at',
    ];

    protected $casts = [
        'type' => TaskActivityTypeEnum::class,
        'from_value' => 'json',
        'to_value' => 'json',
        'task_date' => 'date',
        'occurred_at' => 'datetime',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * The wire shape every consumer gets — the task timeline, the digest and
     * the spreadsheet export all read this one array, so a new field or label
     * only has to be added in one place.
     */
    public function toTimelineArray(): array
    {
        return [
            'id' => (string) $this->id,
            'task_id' => $this->task_id ? (string) $this->task_id : null,
            'type' => $this->type->value,
            'label' => $this->type->label(),
            'color' => $this->type->color(),
            'field' => $this->field,
            'field_label' => TaskFieldEnum::labelFor($this->field),
            'field_is_opaque' => TaskFieldEnum::isOpaqueField($this->field),
            'from' => $this->from_value,
            'to' => $this->to_value,
            'task_date' => $this->task_date?->format('Y-m-d'),
            'occurred_at' => $this->occurred_at->toIso8601String(),
        ];
    }

    public function scopeForChain($query, string $rootTaskId)
    {
        return $query->where('root_task_id', $rootTaskId);
    }

    public function scopeChronological($query)
    {
        return $query->orderBy('occurred_at')->orderBy('id');
    }
}
