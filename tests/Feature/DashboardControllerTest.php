<?php

use App\Models\Period;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('dashboard spreads tasks across projects for the current period', function () {
    $period = Period::factory()->current()->create();

    $alpha = Project::factory()->create(['name' => 'Alpha', 'color' => '#111111']);
    $beta = Project::factory()->create(['name' => 'Beta', 'color' => '#222222']);
    Project::factory()->create(['name' => 'Idle', 'color' => '#333333']);

    Task::factory()->count(3)->forPeriod($period)->create(['project_id' => $alpha->id, 'status' => 'done']);
    Task::factory()->forPeriod($period)->create(['project_id' => $beta->id, 'status' => 'todo']);

    $this->actingAs($this->user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('projectDistribution.period.total', 4)
            ->where('projectDistribution.period.rows.0.name', 'Alpha')
            ->where('projectDistribution.period.rows.0.total', 3)
            ->where('projectDistribution.period.rows.0.done', 3)
            ->where('projectDistribution.period.rows.0.share_pct', 75)
            ->where('projectDistribution.period.rows.1.name', 'Beta')
            ->where('projectDistribution.period.rows.1.total', 1)
            ->where('projectDistribution.period.rows.1.done', 0)
            ->where('projectDistribution.period.rows.2.name', 'Idle')
            ->where('projectDistribution.period.rows.2.total', 0)
        );
});

test('dashboard counts a carry-over task once', function () {
    $period = Period::factory()->current()->create();
    $project = Project::factory()->create(['name' => 'Alpha']);

    $original = Task::factory()->forPeriod($period)->create([
        'project_id' => $project->id,
        'task_date' => $period->start_date,
        'status' => 'todo',
    ]);

    Task::factory()->forPeriod($period)->create([
        'project_id' => $project->id,
        'parent_task_id' => $original->id,
        'task_date' => $period->start_date->copy()->addDay(),
        'status' => 'done',
    ]);

    $this->actingAs($this->user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('projectDistribution.period.total', 1)
            ->where('projectDistribution.period.rows.0.total', 1)
            ->where('projectDistribution.period.rows.0.done', 1)
        );
});

test('dashboard buckets tasks without a project and keeps an all time scope', function () {
    $past = Period::factory()->create([
        'start_date' => now()->subMonths(3)->startOfMonth(),
        'end_date' => now()->subMonths(3)->endOfMonth(),
    ]);

    Task::factory()->forPeriod($past)->create(['project_id' => null]);

    $this->actingAs($this->user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('projectDistribution.period.total', 0)
            ->where('projectDistribution.all.total', 1)
            ->where('projectDistribution.all.rows.0.name', 'No project')
            ->where('projectDistribution.all.rows.0.id', null)
            ->where('projectDistribution.all.rows.0.share_pct', 100)
        );
});
