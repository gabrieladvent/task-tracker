<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property \Illuminate\Support\Carbon $start_date
 * @property \Illuminate\Support\Carbon $end_date
 * @property-read int $duration_in_days
 * @property-read int $completed_tasks_count
 * @property-read int $total_tasks_count
 * @property-read string $display_name
 */
class Period extends Model
{
    use HasFactory;
    use HasUuids;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->name ?? $this->start_date->format('d M').' - '.$this->end_date->format('d M Y');
    }

    public function getDurationInDaysAttribute(): int
    {
        return $this->start_date->diffInDays($this->end_date) + 1;
    }

    public function getCompletedTasksCountAttribute(): int
    {
        return $this->tasks()->where('status', 'done')->count();
    }

    public function getTotalTasksCountAttribute(): int
    {
        return $this->tasks()->count();
    }

    public function scopeCurrent($query)
    {
        $today = Carbon::today();

        return $query->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today);
    }
}
