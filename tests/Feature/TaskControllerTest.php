<?php

use App\Models\Period;
use App\Models\Task;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->period = Period::factory()->create();
});

test('store creates a task under the period with defaults', function () {
    $this->actingAs($this->user)
        ->post(route('periods.tasks.store', $this->period), [
            'task_date' => now()->format('Y-m-d'),
            'title' => 'Implement feature',
        ])
        ->assertRedirect()
        ->assertSessionHas('newTaskId');

    $this->assertDatabaseHas('tasks', [
        'period_id' => $this->period->id,
        'title' => 'Implement feature',
        'status' => 'todo',
        'priority' => 'low',
    ]);
});

test('store validates required title', function () {
    $this->actingAs($this->user)
        ->post(route('periods.tasks.store', $this->period), [
            'task_date' => now()->format('Y-m-d'),
        ])
        ->assertSessionHasErrors('title');
});

test('store rejects an invalid status', function () {
    $this->actingAs($this->user)
        ->post(route('periods.tasks.store', $this->period), [
            'task_date' => now()->format('Y-m-d'),
            'title' => 'Bad status',
            'status' => 'not_a_status',
        ])
        ->assertSessionHasErrors('status');
});

test('update stamps status_changed_at when status changes', function () {
    $task = Task::factory()->forPeriod($this->period)->create([
        'status' => 'todo',
        'status_changed_at' => null,
    ]);

    $this->actingAs($this->user)
        ->put(route('tasks.update', $task), ['status' => 'done'])
        ->assertRedirect();

    $task->refresh();
    expect($task->status->value)->toBe('done')
        ->and($task->status_changed_at)->not->toBeNull();
});

test('destroy removes the task', function () {
    $task = Task::factory()->forPeriod($this->period)->create();

    $this->actingAs($this->user)
        ->delete(route('tasks.destroy', $task))
        ->assertRedirect();

    $this->assertSoftDeleted($task);
});

test('generate tasks is blocked outside the local environment', function () {
    $this->actingAs($this->user)
        ->post(route('periods.generate-tasks', $this->period), [])
        ->assertForbidden();
});

test('task mutation routes require authentication', function () {
    $task = Task::factory()->forPeriod($this->period)->create();

    $this->delete(route('tasks.destroy', $task))->assertRedirect(route('login'));
});
