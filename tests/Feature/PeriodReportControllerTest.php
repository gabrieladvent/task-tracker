<?php

use App\Models\Period;
use App\Models\PeriodReport;
use App\Models\Task;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->period = Period::factory()->create();
});

function makeReport(Period $period, array $overrides = []): PeriodReport
{
    return PeriodReport::create(array_merge([
        'report_name' => 'Report A',
        'report_data' => [],
        'total_tasks' => 0,
        'completed_tasks' => 0,
        'total_story_points' => 0,
    ], $overrides, ['period_id' => $period->id]));
}

test('store generates a report and redirects to it', function () {
    Task::factory()->forPeriod($this->period)->count(3)->create();

    $this->actingAs($this->user)
        ->post(route('periods.reports.store', $this->period), [
            'report_name' => 'December Review',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('period_reports', [
        'period_id' => $this->period->id,
        'report_name' => 'December Review',
    ]);
});

test('store validates report name', function () {
    $this->actingAs($this->user)
        ->post(route('periods.reports.store', $this->period), [])
        ->assertSessionHasErrors('report_name');
});

test('show renders a report', function () {
    $report = makeReport($this->period);

    $this->actingAs($this->user)
        ->get(route('periods.reports.show', ['period' => $this->period, 'report' => $report]))
        ->assertOk();
});

test('destroy removes a report', function () {
    $report = makeReport($this->period);

    $this->actingAs($this->user)
        ->delete(route('periods.reports.destroy', ['period' => $this->period, 'report' => $report]))
        ->assertRedirect(route('periods.reports.index', $this->period->id));

    $this->assertModelMissing($report);
});

test('index all clamps per page', function () {
    $this->actingAs($this->user)
        ->get(route('reports.index', ['per_page' => 999999]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.per_page', 100)
        );
});
