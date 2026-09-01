<?php

namespace App\Models;

use App\Enum\TaskActivityTypeEnum;
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

    public function scopeForChain($query, string $rootTaskId)
    {
        return $query->where('root_task_id', $rootTaskId);
    }

    public function scopeChronological($query)
    {
        return $query->orderBy('occurred_at')->orderBy('id');
    }
}
