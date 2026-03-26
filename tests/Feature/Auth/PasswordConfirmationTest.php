<?php

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

// test('confirm password screen can be rendered', function () {
//     $user = User::factory()->create([
//         'email' => 'user@laravel.com',
//         'password' => bcrypt('password'),
//     ]);

//     // Login sebagai user
//     $this->actingAs($user);

//     $page = visit('/confirm-password')
//         ->on()->desktop()
//         ->inLightMode();

//     $page->assertSee('Confirm Password')
//         ->assertSee('This is a secure area')
//         ->assertSee('Password')
//         ->assertSee('Confirm');
// });

test('password can be confirmed', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/confirm-password', [
        'password' => 'password',
    ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();
});

test('password is not confirmed with invalid password', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/confirm-password', [
        'password' => 'wrong-password',
    ]);

    $response->assertSessionHasErrors();
});
