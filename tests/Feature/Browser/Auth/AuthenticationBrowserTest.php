<?php

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class)
    ->group('browser');

test('login screen can be rendered', function () {
    $page = visit('/login')
        ->on()->desktop()
        ->inLightMode();

    $page->assertSee('Email')
        ->assertSee('Password')
        ->assertSee('Remember me')
        ->assertSee('Welcome Back');
});

test('user can login successfully through browser', function () {
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
        ->assertSee('Dashboard')
        ->assertNoJavascriptErrors();
});

test('validation errors are displayed on login form', function () {
    $page = visit('/login')
        ->on()->desktop()
        ->inLightMode();

    $page->click('button:has-text("LOG IN")')
        ->assertSee('The email field is required.')
        ->assertPathIs('/login');
});

test('invalid credentials show error message', function () {
    User::factory()->create([
        'email' => 'test@example.com',
        'password' => bcrypt('correctpassword'),
    ]);

    $page = visit('/login')
        ->on()->desktop()
        ->inLightMode();

    $page->type('email', 'test@example.com')
        ->type('password', 'wrongpassword')
        ->click('button:has-text("LOG IN")')
        ->assertSee('These credentials do not match our records')
        ->assertPathIs('/login');
});

test('user can logout through browser', function () {
    $user = User::factory()->create([
        'email' => 'logout@test.com',
        'password' => bcrypt('password'),
        'name' => 'logout',
    ]);

    $page = visit('/login')
        ->on()->desktop()
        ->inLightMode();

    $page->type('email', 'logout@test.com')
        ->type('password', 'password')
        ->click('button:has-text("LOG IN")')
        ->assertPathIs('/dashboard');

    $page->click('button:has-text("logout")')
        ->click('button:has-text("Log Out")')
        ->assertPathIs('/login')
        ->assertNoJavascriptErrors();
});
