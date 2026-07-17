<?php

namespace App\Models;

use App\Enum\PriorityEnum;
use App\Enum\StatusEnum;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Collection;

class Task extends Model
{
    use HasFactory;
    use HasUuids;

    protected $fillable = [
        'period_id',
        'parent_task_id',
        'project_id',
        'task_date',
        'title',
        'description',
        'notes',
        'status',
        'priority',
        'story_points',
        'link_pull_request',
        'status_changed_at',
    ];

    protected $casts = [
        'task_date' => 'date',
        'status' => StatusEnum::class,
        'priority' => PriorityEnum::class,
        'status_changed_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::updating(function (Task $task) {
            if ($task->isDirty('status')) {
                $task->status_changed_at = now();
            }
        });
    }

    public function period(): BelongsTo
    {
        return $this->belongsTo(Period::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function parentTask(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'parent_task_id');
    }

    public function childTasks()
    {
        return $this->hasMany(Task::class, 'parent_task_id');
    }

    public function getOriginalTaskId(): string
    {
        return $this->parent_task_id ?? $this->id;
    }

    /**
     * Collapse a collection of tasks to one row per original task, keeping the
     * most recent carry-over version. Shared by the board, dashboard, period
     * stats and reports so their counts stay consistent.
     */
    public static function latestVersions(Collection $tasks): Collection
    {
        return $tasks
            ->groupBy(fn (Task $task) => $task->getOriginalTaskId())
            ->map(fn (Collection $versions) => $versions->sortByDesc('task_date')->first())
            ->values();
    }

    public function scopeDone($query)
    {
        return $query->where('status', 'done');
    }

    public function scopeByDate($query)
    {
        return $query->orderBy('task_date', 'asc')->orderBy('created_at', 'asc');
    }
}
