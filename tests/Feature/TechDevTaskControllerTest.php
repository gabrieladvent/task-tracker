<?php

use App\Models\Period;
use App\Models\Task;
use App\Models\TechDevTask;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('index renders the tech dev backlog', function () {
    TechDevTask::factory()->count(3)->create();

    $this->actingAs($this->user)
        ->get(route('tech-dev.index'))
        ->assertOk();
});

test('store creates a tech dev task', function () {
    $this->actingAs($this->user)
        ->post(route('tech-dev.store'), ['title' => 'Refactor billing'])
        ->assertRedirect();

    $this->assertDatabaseHas('tech_dev_tasks', ['title' => 'Refactor billing']);
});

test('update edits a tech dev task', function () {
    $task = TechDevTask::factory()->create(['title' => 'Old']);

    $this->actingAs($this->user)
        ->put(route('tech-dev.update', $task), ['title' => 'New'])
        ->assertRedirect();

    $this->assertDatabaseHas('tech_dev_tasks', ['id' => $task->id, 'title' => 'New']);
});

test('destroy removes a tech dev task', function () {
    $task = TechDevTask::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('tech-dev.destroy', $task))
        ->assertRedirect();

    $this->assertModelMissing($task);
});

test('move to task fails cleanly when no active period exists', function () {
    // No period covering today.
    $task = TechDevTask::factory()->create();

    $this->actingAs($this->user)
        ->post(route('tech-dev.move-to-task', $task), [
            'task_date' => now()->format('Y-m-d'),
        ])
        ->assertRedirect()
        ->assertSessionHasErrors('task_date');

    // Nothing was moved or created.
    $this->assertModelExists($task);
    expect(Task::count())->toBe(0);
});

test('move to task converts a backlog item into a period task', function () {
    $period = Period::factory()->current()->create();
    $task = TechDevTask::factory()->create(['title' => 'Ship it']);

    $this->actingAs($this->user)
        ->post(route('tech-dev.move-to-task', $task), [
            'task_date' => now()->format('Y-m-d'),
            'status' => 'in_progress',
            'priority' => 'high',
        ])
        ->assertRedirect();

    $this->assertModelMissing($task);
    $this->assertDatabaseHas('tasks', [
        'period_id' => $period->id,
        'title' => 'Ship it',
        'status' => 'in_progress',
        'priority' => 'high',
    ]);
});
