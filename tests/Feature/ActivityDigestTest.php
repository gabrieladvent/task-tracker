<?php

use App\Models\Period;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskActivity;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Artisan;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();

    $this->period = Period::factory()->create([
        'start_date' => Carbon::today()->subDays(20)->format('Y-m-d'),
        'end_date' => Carbon::today()->addDays(10)->format('Y-m-d'),
    ]);
});

test('the digest groups a day\'s events per task chain', function () {
    $task = Task::factory()->forPeriod($this->period)->create(['status' => 'todo']);

    $this->actingAs($this->user)->put(route('tasks.update', $task), ['status' => 'in_progress']);
    $this->actingAs($this->user)->put(route('tasks.update', $task), ['status' => 'done']);

    $this->actingAs($this->user)
        ->get(route('activity.index', ['preset' => 'today']))
        ->assertInertia(fn ($page) => $page
            ->component('Activity/Index')
            ->where('digest.days.0.tasks.0.root_task_id', $task->id)
            // Three events on one task, not three separate entries.
            ->has('digest.days.0.tasks', 1)
            ->has('digest.days.0.tasks.0.activities', 3)
            ->where('digest.days.0.summary.completed', 1)
        );
});

test('a carry-over chain stays one entry across days', function () {
    $original = Task::factory()->create([
        'period_id' => $this->period->id,
        'parent_task_id' => null,
        'task_date' => Carbon::yesterday(),
        'status' => 'in_progress',
        'title' => 'Long running work',
    ]);

    Artisan::call('tasks:copy-incomplete');

    $this->actingAs($this->user)
        ->get(route('activity.index', ['preset' => 'week']))
        ->assertInertia(fn ($page) => $page
            ->where('digest.totals.active_tasks', 1)
            ->where('digest.days.0.tasks.0.title', 'Long running work')
        );
});

test('the project filter only keeps chains belonging to that project', function () {
    $mine = Project::factory()->create();
    $other = Project::factory()->create();

    Task::factory()->forPeriod($this->period)->create(['project_id' => $mine->id]);
    Task::factory()->forPeriod($this->period)->create(['project_id' => $other->id]);

    $this->actingAs($this->user)
        ->get(route('activity.index', ['preset' => 'today', 'project_id' => $mine->id]))
        ->assertInertia(fn ($page) => $page->where('digest.totals.active_tasks', 1));
});

test('days outside the requested range are excluded', function () {
    $task = Task::factory()->forPeriod($this->period)->create();

    TaskActivity::forChain($task->id)->update([
        'occurred_at' => Carbon::today()->subDays(10),
    ]);

    $this->actingAs($this->user)
        ->get(route('activity.index', ['preset' => 'week']))
        ->assertInertia(fn ($page) => $page->where('digest.totals.total', 0)->has('digest.days', 0));

    $this->actingAs($this->user)
        ->get(route('activity.index', ['preset' => 'month']))
        ->assertInertia(fn ($page) => $page->where('digest.totals.total', 1));
});

test('an explicit range switches the view to custom', function () {
    $this->actingAs($this->user)
        ->get(route('activity.index', [
            'from' => Carbon::today()->subDays(3)->format('Y-m-d'),
            'to' => Carbon::today()->format('Y-m-d'),
        ]))
        ->assertInertia(fn ($page) => $page->where('filters.preset', 'custom'));
});

test('an end date before the start date is rejected', function () {
    $this->actingAs($this->user)
        ->get(route('activity.index', [
            'from' => Carbon::today()->format('Y-m-d'),
            'to' => Carbon::today()->subDay()->format('Y-m-d'),
        ]))
        ->assertSessionHasErrors('to');
});

test('deleted tasks still show up in the digest', function () {
    $task = Task::factory()->forPeriod($this->period)->create(['title' => 'Scrapped idea']);

    $task->delete();

    $this->actingAs($this->user)
        ->get(route('activity.index', ['preset' => 'today']))
        ->assertInertia(fn ($page) => $page
            ->where('digest.days.0.tasks.0.title', 'Scrapped idea')
            ->where('digest.days.0.tasks.0.is_deleted', true)
        );
});

test('the digest requires authentication', function () {
    $this->get(route('activity.index'))->assertRedirect(route('login'));
});

test('the export flattens the digest to one row per change', function () {
    $task = Task::factory()->forPeriod($this->period)->create([
        'title' => 'Exported work',
        'status' => 'todo',
    ]);

    $this->actingAs($this->user)->put(route('tasks.update', $task), ['status' => 'in_progress']);

    $digest = app(App\Services\ActivityDigestService::class)->digest(
        Carbon::today(),
        Carbon::today()
    );

    $rows = (new App\Exports\ActivityDigestExport($digest, '2026-09-01', '2026-09-01'))->collection();

    expect($rows)->toHaveCount(2)
        ->and($rows->pluck('task')->unique()->all())->toBe(['Exported work'])
        ->and($rows->pluck('change')->all())->toBe(['Created', 'Status changed'])
        ->and($rows->last()['detail'])->toBe('Todo → In Progress');
});

test('the export uses the same field wording as the timeline', function () {
    $task = Task::factory()->forPeriod($this->period)->create(['story_points' => 3]);

    $this->actingAs($this->user)->put(route('tasks.update', $task), ['story_points' => 8]);

    $digest = app(App\Services\ActivityDigestService::class)->digest(Carbon::today(), Carbon::today());

    $rows = (new App\Exports\ActivityDigestExport($digest, 'a', 'b'))->collection();

    // "Story points", not the "Story Points" a generic humanizer would produce.
    expect($rows->last()['detail'])->toBe('Story points: 3 → 8');
});

test('the export route downloads a spreadsheet for the current filters', function () {
    Maatwebsite\Excel\Facades\Excel::fake();

    Task::factory()->forPeriod($this->period)->create();

    $this->actingAs($this->user)
        ->get(route('activity.export', ['preset' => 'today']))
        ->assertOk();

    Maatwebsite\Excel\Facades\Excel::assertDownloaded(
        sprintf('activity_%s_to_%s.xlsx', Carbon::today()->format('Ymd'), Carbon::today()->format('Ymd'))
    );
});

test('the export rejects an invalid range like the page does', function () {
    $this->actingAs($this->user)
        ->get(route('activity.export', [
            'from' => Carbon::today()->format('Y-m-d'),
            'to' => Carbon::today()->subDay()->format('Y-m-d'),
        ]))
        ->assertSessionHasErrors('to');
});
