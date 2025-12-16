<?php

// tests/Browser/Auth/RegistrationBrowserTest.php
// Browser tests untuk Registration dengan Pest v4

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class)
    ->group('browser');

test('registration screen can be rendered', function () {
    $page = visit('/register')
        ->on()->desktop()
        ->inLightMode();

    $page->assertSee('Register')
        ->assertSee('Name')
        ->assertSee('Email')
        ->assertSee('Password')
        ->assertSee('Confirm Password')
        ->assertSee('Already registered?')
        ->assertSee('REGISTER');
});

test('new user can register successfully through browser', function () {
    $page = visit('/register')
        ->on()->desktop()
        ->inLightMode();

    $page->type('name', 'Test User')
        ->type('email', 'newuser@example.com')
        ->type('password', 'password')
        ->type('password_confirmation', 'password')
        ->press('REGISTER')
        ->assertPathIs('/dashboard')
        ->assertSee('Dashboard')
        ->assertNoJavascriptErrors();
});

test('user can register on mobile device', function () {
    $page = visit('/register')
        ->on()->mobile()
        ->inDarkMode();

    $page->type('name', 'Mobile User')
        ->type('email', 'mobile@example.com')
        ->type('password', 'password')
        ->type('password_confirmation', 'password')
        ->press('REGISTER')
        ->assertPathIs('/dashboard')
        ->assertNoJavascriptErrors();
});

test('registration form shows validation errors', function () {
    $page = visit('/register')
        ->on()->desktop()
        ->inLightMode();

    $page->press('REGISTER')
        ->assertSee('The name field is required')
        ->assertSee('The email field is required')
        ->assertSee('The password field is required')
        ->assertPathIs('/register');
});

test('registration requires valid email format', function () {
    $page = visit('/register')
        ->on()->desktop()
        ->inLightMode();

    $page->type('name', 'Test User')
        ->type('email', 'invalidemail')
        ->type('password', 'password')
        ->type('password_confirmation', 'password')
        ->press('REGISTER')
        ->assertSee('The email field must be a valid email address')
        ->assertPathIs('/register');
});

test('registration requires password confirmation match', function () {
    $page = visit('/register')
        ->on()->desktop()
        ->inLightMode();

    $page->type('name', 'Test User')
        ->type('email', 'test@example.com')
        ->type('password', 'password')
        ->type('password_confirmation', 'differentpassword')
        ->press('REGISTER')
        ->assertSee('The password field confirmation does not match')
        ->assertPathIs('/register');
});

test('registration requires minimum password length', function () {
    $page = visit('/register')
        ->on()->desktop()
        ->inLightMode();

    $page->type('name', 'Test User')
        ->type('email', 'test@example.com')
        ->type('password', '123')
        ->type('password_confirmation', '123')
        ->press('REGISTER')
        ->assertSee('The password field must be at least')
        ->assertPathIs('/register');
});

test('already registered link navigates to login', function () {
    $page = visit('/register')
        ->on()->desktop()
        ->inLightMode();

    $page->click('a:has-text("Already registered?")')
        ->assertPathIs('/login')
        ->assertSee('LOG IN');
});

test('cannot register with existing email', function () {
    // Create existing user
    User::factory()->create([
        'email' => 'existing@example.com',
    ]);

    $page = visit('/register')
        ->on()->desktop()
        ->inLightMode();

    $page->type('name', 'Test User')
        ->type('email', 'existing@example.com')
        ->type('password', 'password')
        ->type('password_confirmation', 'password')
        ->press('REGISTER')
        ->assertSee('The email has already been taken')
        ->assertPathIs('/register');
});

test('registration screen responsive on tablet', function () {
    $page = visit('/register')
        ->on()->tablet()
        ->inLightMode();

    $page->assertSee('Register')
        ->assertSee('Name')
        ->assertSee('Email')
        ->assertNoJavascriptErrors();
});

test('user can switch between light and dark mode on registration', function () {
    $page = visit('/register')
        ->on()->desktop()
        ->inDarkMode();

    $page->assertSee('Register')
        ->assertNoJavascriptErrors();
});
