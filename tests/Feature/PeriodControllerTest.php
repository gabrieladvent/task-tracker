<?php

use App\Models\Period;
use App\Models\User;
use Carbon\Carbon;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('index lists periods', function () {
    Period::factory()->count(2)->create();

    $this->actingAs($this->user)
        ->get(route('periods.index'))
        ->assertOk();
});

test('store creates a period and redirects to it', function () {
    $this->actingAs($this->user)
        ->post(route('periods.store'), [
            'name' => 'Sprint 42',
            'start_date' => '2026-01-01',
            'end_date' => '2026-01-31',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('periods', ['name' => 'Sprint 42']);
});

test('store validates end date after start date', function () {
    $this->actingAs($this->user)
        ->post(route('periods.store'), [
            'name' => 'Broken',
            'start_date' => '2026-01-31',
            'end_date' => '2026-01-01',
        ])
        ->assertSessionHasErrors('end_date');
});

test('show renders a period', function () {
    $period = Period::factory()->create();

    $this->actingAs($this->user)
        ->get(route('periods.show', $period))
        ->assertOk();
});

test('update edits a period', function () {
    $period = Period::factory()->create(['name' => 'Old']);

    $this->actingAs($this->user)
        ->put(route('periods.update', $period), [
            'name' => 'Renamed',
            'start_date' => $period->start_date->format('Y-m-d'),
            'end_date' => $period->end_date->format('Y-m-d'),
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('periods', ['id' => $period->id, 'name' => 'Renamed']);
});

test('destroy removes a period', function () {
    $period = Period::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('periods.destroy', $period))
        ->assertRedirect(route('periods.index'));

    $this->assertSoftDeleted($period);
});

test('last period redirects to the current period', function () {
    $current = Period::factory()->create([
        'start_date' => Carbon::today()->subDays(5)->format('Y-m-d'),
        'end_date' => Carbon::today()->addDays(5)->format('Y-m-d'),
    ]);

    $this->actingAs($this->user)
        ->get(route('periods.last'))
        ->assertRedirect(route('periods.show', $current->id));
});
