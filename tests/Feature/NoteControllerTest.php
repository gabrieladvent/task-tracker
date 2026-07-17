<?php

use App\Models\Note;
use App\Models\NoteTag;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->other = User::factory()->create();
});

test('index only returns notes owned by the authenticated user', function () {
    Note::factory()->for($this->user)->create(['title' => 'Mine']);
    Note::factory()->for($this->other)->create(['title' => 'Theirs']);

    $this->actingAs($this->user)
        ->get(route('notes.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Notes/Index')
            ->has('notes', 1)
            ->where('notes.0.title', 'Mine')
        );
});

test('store creates a note owned by the current user', function () {
    $this->actingAs($this->user)
        ->post(route('notes.store'), [
            'title' => 'New note',
            'content' => 'Body',
            'color' => '#abcdef',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('notes', [
        'title' => 'New note',
        'user_id' => $this->user->id,
    ]);
});

test('store rejects tags belonging to another user', function () {
    $foreignTag = NoteTag::factory()->for($this->other)->create();

    $this->actingAs($this->user)
        ->post(route('notes.store'), [
            'title' => 'New note',
            'tag_ids' => [$foreignTag->id],
        ])
        ->assertSessionHasErrors('tag_ids.0');
});

test('store accepts tags owned by the current user', function () {
    $ownTag = NoteTag::factory()->for($this->user)->create();

    $this->actingAs($this->user)
        ->post(route('notes.store'), [
            'title' => 'Tagged note',
            'tag_ids' => [$ownTag->id],
        ])
        ->assertSessionHasNoErrors();

    $note = Note::where('user_id', $this->user->id)->firstOrFail();
    expect($note->tags)->toHaveCount(1);
});

test('a user cannot update another users note', function () {
    $note = Note::factory()->for($this->other)->create(['title' => 'Original']);

    $this->actingAs($this->user)
        ->patch(route('notes.update', $note), ['title' => 'Hijacked'])
        ->assertForbidden();

    $this->assertDatabaseHas('notes', ['id' => $note->id, 'title' => 'Original']);
});

test('a user cannot delete another users note', function () {
    $note = Note::factory()->for($this->other)->create();

    $this->actingAs($this->user)
        ->delete(route('notes.destroy', $note))
        ->assertForbidden();

    $this->assertDatabaseHas('notes', ['id' => $note->id, 'deleted_at' => null]);
});

test('a user cannot pin or archive another users note', function () {
    $note = Note::factory()->for($this->other)->create();

    $this->actingAs($this->user)
        ->patch(route('notes.pin', $note))
        ->assertForbidden();

    $this->actingAs($this->user)
        ->patch(route('notes.archive', $note))
        ->assertForbidden();
});

test('the owner can update their note', function () {
    $note = Note::factory()->for($this->user)->create(['title' => 'Original']);

    $this->actingAs($this->user)
        ->patch(route('notes.update', $note), ['title' => 'Updated'])
        ->assertRedirect();

    $this->assertDatabaseHas('notes', ['id' => $note->id, 'title' => 'Updated']);
});

test('restore works with a uuid identifier', function () {
    $note = Note::factory()->for($this->user)->create();
    $note->delete();

    $this->actingAs($this->user)
        ->patch(route('notes.restore', $note->id))
        ->assertRedirect();

    $this->assertDatabaseHas('notes', ['id' => $note->id, 'deleted_at' => null]);
});

test('force destroy permanently removes an owned trashed note', function () {
    $note = Note::factory()->for($this->user)->create();
    $note->delete();

    $this->actingAs($this->user)
        ->delete(route('notes.force-destroy', $note->id))
        ->assertRedirect();

    $this->assertDatabaseMissing('notes', ['id' => $note->id]);
});

test('force destroy cannot target another users trashed note', function () {
    $note = Note::factory()->for($this->other)->create();
    $note->delete();

    $this->actingAs($this->user)
        ->delete(route('notes.force-destroy', $note->id))
        ->assertNotFound();

    $this->assertDatabaseHas('notes', ['id' => $note->id]);
});

test('note routes require authentication', function () {
    $this->get(route('notes.index'))->assertRedirect(route('login'));
});
