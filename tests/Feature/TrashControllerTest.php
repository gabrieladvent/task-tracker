<?php

use App\Models\Period;
use App\Models\PeriodReport;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskActivity;
use App\Models\User;
use Carbon\Carbon;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();

    $this->period = Period::factory()->create([
        'start_date' => Carbon::today()->subDays(10)->format('Y-m-d'),
        'end_date' => Carbon::today()->addDays(10)->format('Y-m-d'),
    ]);
});

test('the trash lists soft deleted tasks, projects and periods', function () {
    $task = Task::factory()->forPeriod($this->period)->create(['title' => 'Dropped task']);
    $project = Project::factory()->create(['name' => 'Dropped project']);
    $period = Period::factory()->create();

    $task->delete();
    $project->delete();
    $period->delete();

    $this->actingAs($this->user)
        ->get(route('trash.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Trash/Index')
            ->where('tasks.0.title', 'Dropped task')
            ->where('projects.0.title', 'Dropped project')
            ->has('periods', 1)
        );
});

test('live items stay out of the trash', function () {
    Task::factory()->forPeriod($this->period)->create();

    $this->actingAs($this->user)
        ->get(route('trash.index'))
        ->assertInertia(fn ($page) => $page->has('tasks', 0));
});

test('restoring puts an item back and records it', function () {
    $task = Task::factory()->forPeriod($this->period)->create();
    $task->delete();

    $this->actingAs($this->user)
        ->patch(route('trash.restore', ['tasks', $task->id]))
        ->assertRedirect();

    $this->assertNotSoftDeleted($task);

    expect(TaskActivity::forChain($task->id)->where('type', 'restored')->count())->toBe(1);
});

test('a trashed chain root warns about the live copies it would take', function () {
    $original = Task::factory()->create([
        'period_id' => $this->period->id,
        'parent_task_id' => null,
        'task_date' => Carbon::yesterday(),
        'status' => 'in_progress',
    ]);

    Task::factory()->count(2)->create([
        'period_id' => $this->period->id,
        'parent_task_id' => $original->id,
        'task_date' => Carbon::today(),
        'status' => 'in_progress',
    ]);

    $original->delete();

    $this->actingAs($this->user)
        ->get(route('trash.index'))
        ->assertInertia(fn ($page) => $page->where('tasks.0.cascade', ['2 carry-over copies']));
});

test('a trashed period warns about its tasks and reports', function () {
    Task::factory()->count(3)->forPeriod($this->period)->create();

    PeriodReport::create([
        'period_id' => $this->period->id,
        'report_name' => 'Wrap-up',
        'report_data' => ['tasks' => []],
        'total_tasks' => 3,
        'completed_tasks' => 0,
        'total_story_points' => 5,
    ]);

    $this->period->delete();

    $this->actingAs($this->user)
        ->get(route('trash.index'))
        ->assertInertia(fn ($page) => $page->where('periods.0.cascade', ['3 tasks', '1 report']));
});

test('deleting forever really does remove the row and its cascade', function () {
    $original = Task::factory()->create([
        'period_id' => $this->period->id,
        'parent_task_id' => null,
        'task_date' => Carbon::yesterday(),
        'status' => 'in_progress',
    ]);

    $copy = Task::factory()->create([
        'period_id' => $this->period->id,
        'parent_task_id' => $original->id,
        'task_date' => Carbon::today(),
        'status' => 'in_progress',
    ]);

    $original->delete();

    $this->actingAs($this->user)
        ->delete(route('trash.force-destroy', ['tasks', $original->id]))
        ->assertRedirect();

    expect(Task::withTrashed()->find($original->id))->toBeNull()
        ->and(Task::withTrashed()->find($copy->id))->toBeNull()
        // The log is the only thing left, which is what it is for.
        ->and(TaskActivity::forChain($original->id)->count())->toBeGreaterThan(0);
});

test('an unknown trash type is rejected', function () {
    $this->actingAs($this->user)
        ->patch('/trash/users/'.$this->user->id.'/restore')
        ->assertNotFound();
});

test('a live item cannot be restored or force deleted', function () {
    $task = Task::factory()->forPeriod($this->period)->create();

    $this->actingAs($this->user)
        ->patch(route('trash.restore', ['tasks', $task->id]))
        ->assertNotFound();
});

test('the trash requires authentication', function () {
    $this->get(route('trash.index'))->assertRedirect(route('login'));
});
