<?php

use App\Models\Period;
use App\Models\Task;
use App\Models\User;
use App\Services\StuckTaskService;
use Carbon\Carbon;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();

    $this->period = Period::factory()->create([
        'start_date' => Carbon::today()->subDays(30)->format('Y-m-d'),
        'end_date' => Carbon::today()->addDays(10)->format('Y-m-d'),
    ]);
});

/**
 * Build a chain: one original plus $carryOvers copies on consecutive days,
 * ending today — the shape tasks:copy-incomplete produces.
 */
function chain(Period $period, int $carryOvers, string $status = 'in_progress', array $attributes = []): Task
{
    $start = Carbon::today()->subDays($carryOvers);

    $original = Task::factory()->create(array_merge([
        'period_id' => $period->id,
        'parent_task_id' => null,
        'task_date' => $start,
        'status' => $status,
    ], $attributes));

    for ($day = 1; $day <= $carryOvers; $day++) {
        Task::factory()->create(array_merge([
            'period_id' => $period->id,
            'parent_task_id' => $original->id,
            'task_date' => $start->copy()->addDays($day),
            'status' => $status,
            'title' => $original->title,
        ], $attributes, ['parent_task_id' => $original->id]));
    }

    return $original;
}

test('a chain past the threshold is reported with its carry-over count and age', function () {
    $original = chain($this->period, carryOvers: 5, attributes: ['title' => 'Dragging on']);

    $result = app(StuckTaskService::class)->stuckTasks();

    expect($result['tasks'])->toHaveCount(1);

    $stuck = $result['tasks'][0];

    expect($stuck['root_task_id'])->toBe($original->id)
        ->and($stuck['title'])->toBe('Dragging on')
        ->and($stuck['carry_over_count'])->toBe(5)
        ->and($stuck['age_days'])->toBe(5);
});

test('the threshold is inclusive', function () {
    chain($this->period, carryOvers: StuckTaskService::DEFAULT_THRESHOLD);

    expect(app(StuckTaskService::class)->stuckTasks()['tasks'])->toHaveCount(1);
});

test('a chain below the threshold is left out', function () {
    chain($this->period, carryOvers: StuckTaskService::DEFAULT_THRESHOLD - 1);

    expect(app(StuckTaskService::class)->stuckTasks()['tasks'])->toBeEmpty();
});

test('a finished chain is not stuck however long it dragged', function () {
    chain($this->period, carryOvers: 8, status: 'done');
    chain($this->period, carryOvers: 8, status: 'cancelled');

    expect(app(StuckTaskService::class)->stuckTasks()['tasks'])->toBeEmpty();
});

test('the worst offenders come first', function () {
    chain($this->period, carryOvers: 4, attributes: ['title' => 'Mild']);
    chain($this->period, carryOvers: 12, attributes: ['title' => 'Terrible']);
    chain($this->period, carryOvers: 7, attributes: ['title' => 'Bad']);

    $titles = collect(app(StuckTaskService::class)->stuckTasks()['tasks'])->pluck('title')->all();

    expect($titles)->toBe(['Terrible', 'Bad', 'Mild']);
});

test('a soft deleted chain stops being reported', function () {
    $original = chain($this->period, carryOvers: 6);

    Task::inChain($original->id)->get()->each->delete();

    expect(app(StuckTaskService::class)->stuckTasks()['tasks'])->toBeEmpty();
});

test('the threshold is configurable', function () {
    chain($this->period, carryOvers: 2);

    expect(app(StuckTaskService::class)->stuckTasks(threshold: 1)['tasks'])->toHaveCount(1)
        ->and(app(StuckTaskService::class)->stuckTasks(threshold: 5)['tasks'])->toBeEmpty();
});

test('the dashboard surfaces stuck tasks', function () {
    chain($this->period, carryOvers: 6, attributes: ['title' => 'Never ending']);

    $this->actingAs($this->user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('stuckTasks.threshold', StuckTaskService::DEFAULT_THRESHOLD)
            ->where('stuckTasks.tasks.0.title', 'Never ending')
            ->where('stuckTasks.tasks.0.carry_over_count', 6)
        );
});
