<?php

use App\Models\Task;
use Illuminate\Support\Collection;

/**
 * Build an in-memory task without touching the database.
 */
function makeTask(string $id, ?string $parentId, string $date, string $status): Task
{
    $task = new Task([
        'task_date' => $date,
        'status' => $status,
    ]);
    $task->id = $id;
    $task->parent_task_id = $parentId;

    return $task;
}

test('latest versions collapses carry-over tasks to one row per original', function () {
    $tasks = new Collection([
        makeTask('p1', null, '2025-01-01', 'todo'),
        makeTask('c1', 'p1', '2025-01-03', 'done'),
        makeTask('c0', 'p1', '2025-01-02', 'in_progress'),
        makeTask('p2', null, '2025-01-01', 'todo'),
    ]);

    $result = Task::latestVersions($tasks);

    expect($result)->toHaveCount(2);
});

test('latest versions keeps the newest version of a carry-over chain', function () {
    $tasks = new Collection([
        makeTask('p1', null, '2025-01-01', 'todo'),
        makeTask('c1', 'p1', '2025-01-03', 'done'),
        makeTask('c0', 'p1', '2025-01-02', 'in_progress'),
    ]);

    $latest = Task::latestVersions($tasks)
        ->firstWhere(fn (Task $t) => $t->getOriginalTaskId() === 'p1');

    expect($latest->id)->toBe('c1')
        ->and($latest->status->value)->toBe('done');
});

test('latest versions returns an empty collection for no tasks', function () {
    expect(Task::latestVersions(new Collection))->toHaveCount(0);
});
