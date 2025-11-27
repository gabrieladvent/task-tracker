<?php

namespace App\Models;

use App\Enum\PriorityEnum;
use App\Enum\StatusEnum;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    use HasFactory;
    use HasUuids;

    protected $fillable = [
        'period_id',
        'project_id',
        'task_date',
        'title',
        'description',
        'notes',
        'status',
        'priority',
        'story_points',
        'link_pull_request',
    ];

    protected $casts = [
        'task_date' => 'date',
        'status' => StatusEnum::class,
        'priority' => PriorityEnum::class,
    ];

    public function period(): BelongsTo
    {
        return $this->belongsTo(Period::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function scopeDone($query)
    {
        return $query->where('status', 'done');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeByDate($query)
    {
        return $query->orderBy('task_date', 'asc')->orderBy('created_at', 'asc');
    }
}
