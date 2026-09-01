<?php

use App\Models\Period;
use App\Models\Task;
use App\Models\TaskActivity;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Artisan;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();

    $this->period = Period::factory()->create([
        'start_date' => Carbon::today()->subDays(10)->format('Y-m-d'),
        'end_date' => Carbon::today()->addDays(10)->format('Y-m-d'),
    ]);
});

test('creating a task logs a created activity anchored to itself', function () {
    $task = Task::factory()->forPeriod($this->period)->create(['parent_task_id' => null]);

    $activity = TaskActivity::forChain($task->id)->sole();

    expect($activity->type->value)->toBe('created')
        ->and($activity->task_id)->toBe($task->id)
        ->and($activity->root_task_id)->toBe($task->id);
});

test('changing status logs the transition with both ends', function () {
    $task = Task::factory()->forPeriod($this->period)->create(['status' => 'todo']);

    $this->actingAs($this->user)
        ->put(route('tasks.update', $task), ['status' => 'in_progress'])
        ->assertRedirect();

    $activity = TaskActivity::forChain($task->id)->where('type', 'status_changed')->sole();

    expect($activity->from_value)->toBe('todo')
        ->and($activity->to_value)->toBe('in_progress');
});

test('editing notes does not pollute the timeline', function () {
    $task = Task::factory()->forPeriod($this->period)->create();

    $this->actingAs($this->user)
        ->put(route('tasks.update', $task), ['notes' => '{"blocks":[]}'])
        ->assertRedirect();

    expect(TaskActivity::forChain($task->id)->where('type', '!=', 'created')->count())->toBe(0);
});

test('a carry-over appends to the original chain instead of starting a new one', function () {
    $original = Task::factory()->create([
        'period_id' => $this->period->id,
        'parent_task_id' => null,
        'task_date' => Carbon::yesterday(),
        'status' => 'in_progress',
        'title' => 'Still going',
    ]);

    Artisan::call('tasks:copy-incomplete');

    $copy = Task::where('parent_task_id', $original->id)->sole();

    $carriedOver = TaskActivity::forChain($original->id)->where('type', 'carried_over')->sole();

    expect($carriedOver->task_id)->toBe($copy->id)
        ->and($carriedOver->from_value)->toBe(Carbon::yesterday()->format('Y-m-d'))
        ->and($carriedOver->to_value)->toBe(Carbon::today()->format('Y-m-d'));
});

test('the timeline endpoint returns the whole chain from any of its copies', function () {
    $original = Task::factory()->create([
        'period_id' => $this->period->id,
        'parent_task_id' => null,
        'task_date' => Carbon::yesterday(),
        'status' => 'in_progress',
    ]);

    Artisan::call('tasks:copy-incomplete');

    $copy = Task::where('parent_task_id', $original->id)->sole();

    $response = $this->actingAs($this->user)
        ->getJson(route('tasks.activities', $copy))
        ->assertOk();

    expect($response->json('summary.root_task_id'))->toBe($original->id)
        ->and($response->json('summary.version_count'))->toBe(2)
        ->and($response->json('summary.carry_over_count'))->toBe(1)
        ->and(collect($response->json('activities'))->pluck('type')->all())
        ->toBe(['created', 'carried_over']);
});

test('the log outlives the tasks it describes', function () {
    $original = Task::factory()->create([
        'period_id' => $this->period->id,
        'parent_task_id' => null,
        'task_date' => Carbon::yesterday(),
        'status' => 'in_progress',
    ]);

    Artisan::call('tasks:copy-incomplete');

    // A normal delete is soft now, so force one: this is the only remaining
    // path where the chain really leaves the database and takes its rows with
    // it through the parent_task_id cascade.
    $original->forceDelete();

    expect(Task::inChain($original->id)->count())->toBe(0)
        ->and(TaskActivity::forChain($original->id)->count())->toBeGreaterThan(0);
});

test('backfill reconstructs history for tasks created before logging existed', function () {
    $task = Task::factory()->forPeriod($this->period)->create([
        'status_changed_at' => Carbon::now(),
    ]);

    TaskActivity::query()->delete();

    Artisan::call('tasks:backfill-activities');

    expect(TaskActivity::forChain($task->id)->pluck('type')->map->value->all())
        ->toEqualCanonicalizing(['created', 'status_changed']);

    // Running it again must not duplicate anything.
    Artisan::call('tasks:backfill-activities');

    expect(TaskActivity::forChain($task->id)->count())->toBe(2);
});
