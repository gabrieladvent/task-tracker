<?php

use App\Models\Period;
use App\Models\PeriodReport;
use App\Models\Project;
use App\Models\Task;
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

test('deleting a project leaves its tasks alone', function () {
    $project = Project::factory()->create();

    $tasks = Task::factory()->count(3)->forPeriod($this->period)->create([
        'project_id' => $project->id,
    ]);

    $this->actingAs($this->user)
        ->delete(route('projects.destroy', $project))
        ->assertRedirect();

    $this->assertSoftDeleted($project);

    foreach ($tasks as $task) {
        $this->assertNotSoftDeleted($task);
    }
});

test('a task keeps showing its project after the project is deleted', function () {
    $project = Project::factory()->create(['name' => 'Kraken']);
    $task = Task::factory()->forPeriod($this->period)->create(['project_id' => $project->id]);

    $project->delete();

    expect($task->fresh()->project?->name)->toBe('Kraken');
});

test('deleting a period keeps its tasks and generated reports', function () {
    $task = Task::factory()->forPeriod($this->period)->create();

    $report = PeriodReport::create([
        'period_id' => $this->period->id,
        'report_name' => 'Sprint wrap-up',
        'report_data' => ['tasks' => []],
        'total_tasks' => 1,
        'completed_tasks' => 0,
        'total_story_points' => 3,
    ]);

    $this->actingAs($this->user)
        ->delete(route('periods.destroy', $this->period))
        ->assertRedirect();

    $this->assertSoftDeleted($this->period);
    $this->assertNotSoftDeleted($task);
    $this->assertDatabaseHas('period_reports', ['id' => $report->id]);
});

test('deleting the first task of a chain keeps the carry-over copies', function () {
    $original = Task::factory()->create([
        'period_id' => $this->period->id,
        'parent_task_id' => null,
        'task_date' => Carbon::yesterday(),
        'status' => 'in_progress',
    ]);

    Artisan::call('tasks:copy-incomplete');

    $copy = Task::where('parent_task_id', $original->id)->sole();

    $this->actingAs($this->user)
        ->delete(route('tasks.destroy', $original))
        ->assertRedirect();

    $this->assertSoftDeleted($original);
    $this->assertNotSoftDeleted($copy);
});

test('deleted tasks drop out of the board', function () {
    $kept = Task::factory()->forPeriod($this->period)->create(['title' => 'Still here']);
    $gone = Task::factory()->forPeriod($this->period)->create(['title' => 'Removed']);

    $gone->delete();

    expect($this->period->tasks()->pluck('title')->all())->toBe(['Still here'])
        ->and($kept->fresh())->not->toBeNull();
});

test('the digest does not link to a deleted period', function () {
    $task = Task::factory()->forPeriod($this->period)->create();

    $this->period->delete();

    $this->actingAs($this->user)
        ->get(route('activity.index', ['preset' => 'today']))
        ->assertInertia(fn ($page) => $page
            ->where('digest.days.0.tasks.0.root_task_id', $task->id)
            ->where('digest.days.0.tasks.0.period_id', null)
        );
});
