<?php

use App\Models\Project;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('index renders the project list', function () {
    Project::factory()->count(2)->create();

    $this->actingAs($this->user)
        ->get(route('projects.index'))
        ->assertOk();
});

test('store creates a project', function () {
    $this->actingAs($this->user)
        ->post(route('projects.store'), [
            'name' => 'Atlas',
            'color' => '#123456',
        ])
        ->assertRedirect(route('projects.index'));

    $this->assertDatabaseHas('projects', ['name' => 'Atlas']);
});

test('store validates required name', function () {
    $this->actingAs($this->user)
        ->post(route('projects.store'), ['color' => '#123456'])
        ->assertSessionHasErrors('name');
});

test('update edits a project', function () {
    $project = Project::factory()->create(['name' => 'Old']);

    $this->actingAs($this->user)
        ->put(route('projects.update', $project), [
            'name' => 'New',
            'color' => '#000000',
        ])
        ->assertRedirect(route('projects.index'));

    $this->assertDatabaseHas('projects', ['id' => $project->id, 'name' => 'New']);
});

test('destroy removes a project', function () {
    $project = Project::factory()->create();

    $this->actingAs($this->user)
        ->delete(route('projects.destroy', $project))
        ->assertRedirect(route('projects.index'));

    $this->assertSoftDeleted($project);
});

test('per page is clamped to a sane maximum', function () {
    $this->actingAs($this->user)
        ->get(route('projects.index', ['per_page' => 999999]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.per_page', 100)
        );
});

test('project api endpoint returns json', function () {
    Project::factory()->create(['name' => 'Atlas']);

    $this->actingAs($this->user)
        ->getJson(route('projects.api.index'))
        ->assertOk()
        ->assertJsonFragment(['name' => 'Atlas']);
});
