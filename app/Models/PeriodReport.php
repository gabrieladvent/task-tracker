<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PeriodReport extends Model
{
    use HasUuids;

    protected $fillable = [
        'period_id',
        'report_name',
        'report_data',
        'total_tasks',
        'completed_tasks',
        'total_story_points',
    ];

    protected $casts = [
        'report_data' => 'array',
    ];

    public function period(): BelongsTo
    {
        return $this->belongsTo(Period::class);
    }
}
