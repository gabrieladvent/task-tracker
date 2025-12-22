<?php

use App\Enum\StatusEnum;
use App\Models\Period;
use App\Models\Project;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Support\Facades\Artisan;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->project = Project::factory()->create();

    $today = Carbon::today();
    $yesterday = Carbon::yesterday();

    $this->currentPeriod = Period::factory()->create([
        'name' => 'Current Sprint',
        'start_date' => $yesterday->copy()->subDays(10)->format('Y-m-d'),
        'end_date' => $today->copy()->addDays(10)->format('Y-m-d'),
    ]);

    $this->period1 = Period::factory()->create([
        'name' => 'Sprint 1',
        'start_date' => '2024-12-01',
        'end_date' => '2024-12-15',
    ]);

    $this->period2 = Period::factory()->create([
        'name' => 'Sprint 2',
        'start_date' => '2024-12-16',
        'end_date' => '2024-12-31',
    ]);
});

test('command copies incomplete tasks from yesterday to today', function () {
    $yesterday = Carbon::yesterday()->startOfDay();
    $today = Carbon::today()->startOfDay();

    Task::factory()->create([
        'period_id' => $this->currentPeriod->id,
        'project_id' => $this->project->id,
        'task_date' => $yesterday,
        'title' => 'Incomplete Task',
        'status' => StatusEnum::IN_PROGRESS,
    ]);

    $exitCode = Artisan::call('tasks:copy-incomplete');

    expect($exitCode)->toBe(0);

    $copiedTasks = Task::whereDate('task_date', $today->format('Y-m-d'))
        ->where('title', 'Incomplete Task')
        ->get();

    expect($copiedTasks->count())->toBe(1);

    expect($copiedTasks->first()->status)->toBe(StatusEnum::IN_PROGRESS);
});

test('command does not copy completed tasks', function () {
    $yesterday = Carbon::yesterday()->startOfDay();
    $today = Carbon::today()->startOfDay();

    Task::factory()->create([
        'period_id' => $this->currentPeriod->id,
        'task_date' => $yesterday,
        'title' => 'Completed Task',
        'status' => 'done',
    ]);

    Artisan::call('tasks:copy-incomplete');

    expect(
        Task::whereDate('task_date', $today->format('Y-m-d'))
            ->where('title', 'Completed Task')
            ->count()
    )->toBe(0);
});

test('command does not copy cancelled tasks', function () {
    $yesterday = Carbon::yesterday()->startOfDay();
    $today = Carbon::today()->startOfDay();

    Task::factory()->create([
        'period_id' => $this->currentPeriod->id,
        'task_date' => $yesterday,
        'title' => 'Cancelled Task',
        'status' => 'cancelled',
    ]);

    Artisan::call('tasks:copy-incomplete');

    expect(
        Task::whereDate('task_date', $today->format('Y-m-d'))
            ->where('title', 'Cancelled Task')
            ->count()
    )->toBe(0);
});

test('command does not copy on_hold tasks', function () {
    $yesterday = Carbon::yesterday()->startOfDay();
    $today = Carbon::today()->startOfDay();

    Task::factory()->create([
        'period_id' => $this->currentPeriod->id,
        'task_date' => $yesterday,
        'title' => 'On Hold Task',
        'status' => 'on_hold',
    ]);

    Artisan::call('tasks:copy-incomplete');

    expect(
        Task::whereDate('task_date', $today->format('Y-m-d'))
            ->where('title', 'On Hold Task')
            ->count()
    )->toBe(0);
});

test('command copies tasks with custom date range', function () {
    $fromDate = Carbon::parse('2024-12-10')->startOfDay();
    $toDate = Carbon::parse('2024-12-20')->startOfDay();

    Task::factory()->create([
        'period_id' => $this->period1->id,
        'task_date' => $fromDate,
        'title' => 'Custom Date Task',
        'status' => 'in_progress',
    ]);

    $exitCode = Artisan::call('tasks:copy-incomplete', [
        '--from-date' => '2024-12-10',
        '--date' => '2024-12-20',
    ]);

    expect($exitCode)->toBe(0);

    $copiedTask = Task::whereDate('task_date', $toDate->format('Y-m-d'))
        ->where('title', 'Custom Date Task')
        ->first();

    expect($copiedTask)->not->toBeNull();
    expect($copiedTask->period_id)->toBe($this->period2->id);
});

test('command copies tasks across different periods', function () {
    $fromDate = Carbon::parse('2024-12-15')->startOfDay();
    $toDate = Carbon::parse('2024-12-16')->startOfDay();

    Task::factory()->create([
        'period_id' => $this->period1->id,
        'task_date' => $fromDate,
        'title' => 'Cross Period Task',
        'status' => 'in_progress',
    ]);

    $exitCode = Artisan::call('tasks:copy-incomplete', [
        '--from-date' => '2024-12-15',
        '--date' => '2024-12-16',
    ]);

    expect($exitCode)->toBe(0);

    $copiedTask = Task::whereDate('task_date', $toDate->format('Y-m-d'))
        ->where('title', 'Cross Period Task')
        ->first();

    expect($copiedTask)->not->toBeNull();
    expect($copiedTask->period_id)->toBe($this->period2->id);
});

test('command skips duplicate tasks', function () {
    $yesterday = Carbon::yesterday()->startOfDay();
    $today = Carbon::today()->startOfDay();

    Task::factory()->create([
        'period_id' => $this->currentPeriod->id,
        'task_date' => $yesterday,
        'title' => 'Duplicate Task',
        'status' => 'in_progress',
    ]);

    Task::factory()->create([
        'period_id' => $this->currentPeriod->id,
        'task_date' => $today,
        'title' => 'Duplicate Task',
        'status' => 'in_progress',
    ]);

    Artisan::call('tasks:copy-incomplete');

    expect(
        Task::whereDate('task_date', $today->format('Y-m-d'))
            ->where('title', 'Duplicate Task')
            ->count()
    )->toBe(1);
});

test('command returns success when no incomplete tasks found', function () {
    $exitCode = Artisan::call('tasks:copy-incomplete');
    expect($exitCode)->toBe(0);
});

test('command returns failure when no period found for target date', function () {
    Task::factory()->create([
        'period_id' => $this->period1->id,
        'task_date' => '2024-12-10',
        'status' => 'in_progress',
    ]);

    $exitCode = Artisan::call('tasks:copy-incomplete', [
        '--from-date' => '2024-12-10',
        '--date' => '2026-12-01',
    ]);

    expect($exitCode)->toBe(1);
});

test('command copies all task attributes correctly', function () {
    $yesterday = Carbon::yesterday()->startOfDay();
    $today = Carbon::today()->startOfDay();

    $originalTask = Task::factory()->create([
        'period_id' => $this->currentPeriod->id,
        'project_id' => $this->project->id,
        'task_date' => $yesterday,
        'title' => 'Full Task',
        'description' => 'Task description',
        'status' => 'in_progress',
        'priority' => 'high',
        'story_points' => 5,
        'notes' => 'Some notes',
        'link_pull_request' => 'https://github.com/pr/123',
    ]);

    Artisan::call('tasks:copy-incomplete');

    $copiedTask = Task::whereDate('task_date', $today->format('Y-m-d'))
        ->where('title', 'Full Task')
        ->first();

    expect($copiedTask)->not->toBeNull();
    expect($copiedTask->description)->toBe($originalTask->description);
    expect($copiedTask->status)->toBe($originalTask->status);
    expect($copiedTask->priority)->toBe($originalTask->priority);
    expect($copiedTask->story_points)->toBe($originalTask->story_points);
    expect($copiedTask->notes)->toBe($originalTask->notes);
    expect($copiedTask->link_pull_request)->toBe($originalTask->link_pull_request);
    expect($copiedTask->project_id)->toBe($originalTask->project_id);
});

test('command copies multiple incomplete tasks', function () {
    $yesterday = Carbon::yesterday()->startOfDay();
    $today = Carbon::today()->startOfDay();

    Task::factory()->count(3)->create([
        'period_id' => $this->currentPeriod->id,
        'task_date' => $yesterday,
        'status' => 'in_progress',
    ]);

    Artisan::call('tasks:copy-incomplete');

    expect(Task::whereDate('task_date', $today->format('Y-m-d'))->count())->toBe(3);
});

test('command output shows copied task count', function () {
    $yesterday = Carbon::yesterday()->startOfDay();

    Task::factory()->count(2)->create([
        'period_id' => $this->currentPeriod->id,
        'task_date' => $yesterday,
        'status' => 'in_progress',
    ]);

    Artisan::call('tasks:copy-incomplete');

    $output = Artisan::output();

    expect($output)->toContain('Successfully copied 2 task(s)');
});

test('command shows warning for skipped duplicates', function () {
    $yesterday = Carbon::yesterday()->startOfDay();
    $today = Carbon::today()->startOfDay();

    Task::factory()->create([
        'period_id' => $this->currentPeriod->id,
        'task_date' => $yesterday,
        'title' => 'Duplicate Task',
        'status' => 'in_progress',
    ]);

    Task::factory()->create([
        'period_id' => $this->currentPeriod->id,
        'task_date' => $today,
        'title' => 'Duplicate Task',
        'status' => 'in_progress',
    ]);

    Artisan::call('tasks:copy-incomplete');

    $output = Artisan::output();

    expect($output)->toContain('already exists');
});

test('command displays period information when copying', function () {
    $yesterday = Carbon::yesterday()->startOfDay();

    Task::factory()->create([
        'period_id' => $this->currentPeriod->id,
        'task_date' => $yesterday,
        'title' => 'Test Task',
        'status' => 'in_progress',
    ]);

    Artisan::call('tasks:copy-incomplete');

    $output = Artisan::output();

    expect($output)->toContain('Target period:');
    expect($output)->toContain($this->currentPeriod->name);
});
