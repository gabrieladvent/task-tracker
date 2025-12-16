<?php

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('login screen can be rendered', function () {
    // Buat user terlebih dahulu
    $user = User::factory()->create([
        'email' => 'nuno@laravel.com',
        'password' => bcrypt('password'),
    ]);

    $page = visit('/login')
        ->on()->desktop()
        ->inLightMode();

    $page->assertSee('Email')
        ->type('email', 'nuno@laravel.com')
        ->type('password', 'password')
        ->click('button:has-text("LOG IN")')
        ->assertPathIs('/dashboard')
        ->assertSee('Dashboard');
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});
