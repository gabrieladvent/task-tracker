<?php

// tests/Browser/Auth/PasswordResetBrowserTest.php

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class)
    ->group('browser');

test('reset password link screen can be rendered', function () {
    $page = visit('/forgot-password')
        ->on()->desktop()
        ->inLightMode();

    $page->assertSee('Forgot your password?')
        ->assertSee('Forgot your password')
        ->assertSee('Email')
        ->assertSee('Email Password Reset Link');
});

test('user can request password reset link through browser', function () {
    Notification::fake();

    $user = User::factory()->create([
        'email' => 'reset@example.com',
    ]);

    $page = visit('/forgot-password')
        ->on()->desktop()
        ->inLightMode();

    $page->type('email', 'reset@example.com')
        ->press('Email Password Reset Link')
        ->assertSee('We have emailed your password reset link')
        ->assertNoJavascriptErrors();

    Notification::assertSentTo($user, ResetPassword::class);
});

test('forgot password form shows validation errors', function () {
    $page = visit('/forgot-password')
        ->on()->desktop()
        ->inLightMode();

    $page->press('Email Password Reset Link')
        ->assertSee('The email field is required')
        ->assertPathIs('/forgot-password');
})->todo();

test('forgot password requires valid email format', function () {
    $page = visit('/forgot-password')
        ->on()->desktop()
        ->inLightMode();

    $page->type('email', 'invalidemail')
        ->press('Email Password Reset Link')
        ->assertSee('The email field must be a valid email address')
        ->assertPathIs('/forgot-password');
});

test('forgot password shows error for non-existent email', function () {
    $page = visit('/forgot-password')
        ->on()->desktop()
        ->inLightMode();

    $page->type('email', 'nonexistent@example.com')
        ->press('Email Password Reset Link')
        ->assertSee("We can't find a user with that email address")
        ->assertPathIs('/forgot-password');
})->todo();

test('user can navigate back to login from forgot password', function () {
    $page = visit('/forgot-password')
        ->on()->desktop()
        ->inLightMode();

    // Assuming there's a "Back to login" link or similar
    $page->click('a:has-text("login")')
        ->assertPathIs('/login');
});

test('reset password screen can be rendered with token', function () {
    $user = User::factory()->create([
        'email' => 'tokentest@example.com',
    ]);

    $token = Password::createToken($user);

    $page = visit("/reset-password/{$token}?email={$user->email}")
        ->on()->desktop()
        ->inLightMode();

    $page->assertSee('Reset Password')
        ->assertSee('Email')
        ->assertSee('Password')
        ->assertSee('Confirm Password')
        ->assertSee('Reset Password');
})->todo();

test('user can reset password with valid token through browser', function () {
    $user = User::factory()->create([
        'email' => 'resetvalid@example.com',
    ]);

    $token = Password::createToken($user);

    $page = visit("/reset-password/{$token}?email={$user->email}")
        ->on()->desktop()
        ->inLightMode();

    $page->type('email', $user->email)
        ->type('password', 'newpassword')
        ->type('password_confirmation', 'newpassword')
        ->press('Reset Password')
        ->assertPathIs('/login')
        ->assertSee('Your password has been reset')
        ->assertNoJavascriptErrors();
})->todo();

test('reset password form shows validation errors', function () {
    $user = User::factory()->create([
        'email' => 'validation@example.com',
    ]);

    $token = Password::createToken($user);

    $page = visit("/reset-password/{$token}?email={$user->email}")
        ->on()->desktop()
        ->inLightMode();

    $page->press('Reset Password')
        ->assertSee('The password field is required')
        ->assertPathIs('/reset-password');
});

test('reset password requires matching confirmation', function () {
    $user = User::factory()->create([
        'email' => 'mismatch@example.com',
    ]);

    $token = Password::createToken($user);

    $page = visit("/reset-password/{$token}?email={$user->email}")
        ->on()->desktop()
        ->inLightMode();

    $page->type('email', $user->email)
        ->type('password', 'newpassword')
        ->type('password_confirmation', 'differentpassword')
        ->press('Reset Password')
        ->assertSee('The password field confirmation does not match');
})->todo();

test('reset password fails with invalid token', function () {
    $user = User::factory()->create([
        'email' => 'invalidtoken@example.com',
    ]);

    $page = visit("/reset-password/invalid-token?email={$user->email}")
        ->on()->desktop()
        ->inLightMode();

    $page->type('email', $user->email)
        ->type('password', 'newpassword')
        ->type('password_confirmation', 'newpassword')
        ->press('Reset Password')
        ->assertSee('This password reset token is invalid');
});

test('reset password works on mobile device', function () {
    $user = User::factory()->create([
        'email' => 'mobile@example.com',
    ]);

    $token = Password::createToken($user);

    $page = visit("/reset-password/{$token}?email={$user->email}")
        ->on()->mobile()
        ->inDarkMode();

    $page->type('email', $user->email)
        ->type('password', 'newpassword')
        ->type('password_confirmation', 'newpassword')
        ->press('Reset Password')
        ->assertPathIs('/login')
        ->assertNoJavascriptErrors();
});
