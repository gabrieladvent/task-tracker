<?php

use App\Models\Period;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();

    $this->period = Period::factory()->create([
        'start_date' => Carbon::today()->subDays(30)->format('Y-m-d'),
        'end_date' => Carbon::today()->addDays(10)->format('Y-m-d'),
    ]);
});

/**
 * An original plus $carryOvers copies on consecutive days, the newest one
 * carrying $latestStatus — the shape tasks:copy-incomplete leaves behind.
 */
function carryOverChain(Period $period, int $carryOvers, array $attributes = [], string $latestStatus = 'in_progress'): Task
{
    $start = Carbon::today()->subDays($carryOvers);

    $original = Task::factory()->create(array_merge([
        'period_id' => $period->id,
        'task_date' => $start,
        'status' => 'todo',
    ], $attributes));

    for ($day = 1; $day <= $carryOvers; $day++) {
        Task::factory()->create(array_merge([
            'period_id' => $period->id,
            'task_date' => $start->copy()->addDays($day),
            'title' => $original->title,
            'project_id' => $original->project_id,
            'status' => $day === $carryOvers ? $latestStatus : 'todo',
        ], $attributes, ['parent_task_id' => $original->id]));
    }

    return $original;
}

test('a carried-over task is listed once, as its latest copy', function () {
    $original = carryOverChain($this->period, carryOvers: 3, latestStatus: 'code_review');
    Task::factory()->create(['period_id' => $this->period->id, 'task_date' => Carbon::today()->subDays(10)]);

    $this->actingAs($this->user)
        ->get(route('periods.all-tasks'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Periods/AllTasks')
            ->where('tasks.total', 2)
            ->has('tasks.data', 2)
            ->where('tasks.data.0.root_task_id', $original->id)
            ->where('tasks.data.0.status', 'code_review')
            ->where('tasks.data.0.task_date', Carbon::today()->format('Y-m-d'))
            ->where('tasks.data.0.first_task_date', Carbon::today()->subDays(3)->format('Y-m-d'))
            ->where('tasks.data.0.version_count', 4)
            ->where('tasks.data.0.carry_over_count', 3)
            ->where('tasks.data.1.carry_over_count', 0)
        );
});

test('a soft deleted latest copy hands the row back to the previous one', function () {
    $original = carryOverChain($this->period, carryOvers: 2);

    Task::where('parent_task_id', $original->id)->orderByDesc('task_date')->first()->delete();

    $this->actingAs($this->user)
        ->get(route('periods.all-tasks'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('tasks.total', 1)
            ->where('tasks.data.0.task_date', Carbon::today()->subDay()->format('Y-m-d'))
            ->where('tasks.data.0.carry_over_count', 1)
        );
});

test('two copies on the same day still collapse to one row', function () {
    $original = Task::factory()->create(['period_id' => $this->period->id, 'task_date' => Carbon::today()]);
    Task::factory()->create([
        'period_id' => $this->period->id,
        'parent_task_id' => $original->id,
        'task_date' => Carbon::today(),
        'created_at' => $original->created_at,
    ]);

    $this->actingAs($this->user)
        ->get(route('periods.all-tasks'))
        ->assertInertia(fn (Assert $page) => $page->where('tasks.total', 1));
});

test('filters apply to the latest copy of each chain', function () {
    $kraken = Project::factory()->create();

    carryOverChain($this->period, carryOvers: 2, attributes: ['title' => 'Fix login', 'project_id' => $kraken->id], latestStatus: 'done');
    carryOverChain($this->period, carryOvers: 1, attributes: ['title' => 'Write docs'], latestStatus: 'in_progress');

    $this->actingAs($this->user)
        ->get(route('periods.all-tasks', ['status' => 'done']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('tasks.total', 1)
            ->where('tasks.data.0.title', 'Fix login')
        );

    // Earlier copies were "todo", but the chain is done now — it must not
    // resurface through a stale copy.
    $this->actingAs($this->user)
        ->get(route('periods.all-tasks', ['status' => 'todo']))
        ->assertInertia(fn (Assert $page) => $page->where('tasks.total', 0));

    $this->actingAs($this->user)
        ->get(route('periods.all-tasks', ['search' => 'docs']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('tasks.total', 1)
            ->where('tasks.data.0.title', 'Write docs')
        );

    $this->actingAs($this->user)
        ->get(route('periods.all-tasks', ['project_id' => $kraken->id]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('tasks.total', 1)
            ->where('tasks.data.0.project', $kraken->name)
        );
});

test('pagination counts chains, not copies', function () {
    foreach (range(1, 12) as $i) {
        carryOverChain($this->period, carryOvers: 2);
    }

    $this->actingAs($this->user)
        ->get(route('periods.all-tasks', ['per_page' => 10]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('tasks.total', 12)
            ->has('tasks.data', 10)
            ->where('tasks.last_page', 2)
        );
});

test('the all-tasks path is not mistaken for a period', function () {
    $this->actingAs($this->user)
        ->get('/periods/all-tasks')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Periods/AllTasks'));
});

test('guests are sent to login', function () {
    $this->get(route('periods.all-tasks'))->assertRedirect(route('login'));
});
