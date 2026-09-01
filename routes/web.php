<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\PeriodController;
use App\Http\Controllers\PeriodReportController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TechDevTaskController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('periods', PeriodController::class);

    Route::get('period/last', [PeriodController::class, 'lastPeriod'])->name('periods.last');

    Route::prefix('periods/{period}')->group(function () {
        Route::post('/tasks', [TaskController::class, 'store'])->name('periods.tasks.store');

        Route::post('/generate-tasks', [TaskController::class, 'generateTasks'])
            ->name('periods.generate-tasks');
    });

    Route::get('/activity', [ActivityController::class, 'index'])->name('activity.index');
    Route::get('/activity/export', [ActivityController::class, 'export'])->name('activity.export');

    Route::get('/project', [ProjectController::class, 'getAllProject'])->name('projects.api.index');

    Route::resource('projects', ProjectController::class);

    Route::prefix('tasks')->group(function () {
        Route::get('/{task}/activities', [TaskController::class, 'activities'])->name('tasks.activities');
        Route::put('/{task}', [TaskController::class, 'update'])->name('tasks.update');
        Route::delete('/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
    });

    Route::get('/reports', [PeriodReportController::class, 'indexAll'])->name('reports.index');

    Route::prefix('periods/{period}/reports')->group(function () {
        Route::get('/', [PeriodReportController::class, 'index'])->name('periods.reports.index');
        Route::post('/', [PeriodReportController::class, 'store'])->name('periods.reports.store');
        Route::get('/{report}', [PeriodReportController::class, 'show'])->name('periods.reports.show');
        Route::get('/{report}/export', [PeriodReportController::class, 'export'])->name('periods.reports.export');
        Route::delete('/{report}', [PeriodReportController::class, 'destroy'])->name('periods.reports.destroy');
    });

    Route::prefix('tech-dev')->name('tech-dev.')->group(function () {
        Route::get('/', [TechDevTaskController::class, 'index'])->name('index');
        Route::post('/', [TechDevTaskController::class, 'store'])->name('store');
        Route::put('/{techDevTask}', [TechDevTaskController::class, 'update'])->name('update');
        Route::delete('/{techDevTask}', [TechDevTaskController::class, 'destroy'])->name('destroy');
        Route::post('/{techDevTask}/move-to-task', [TechDevTaskController::class, 'moveToTask'])->name('move-to-task');
    });

    Route::prefix('notes')->name('notes.')->group(function () {
        Route::get('/', [NoteController::class, 'index'])->name('index');
        Route::post('/', [NoteController::class, 'store'])->name('store');
        Route::patch('/{note}', [NoteController::class, 'update'])->name('update');
        Route::delete('/{note}', [NoteController::class, 'destroy'])->name('destroy');

        Route::patch('/{note}/pin', [NoteController::class, 'togglePin'])->name('pin');
        Route::patch('/{note}/archive', [NoteController::class, 'archive'])->name('archive');
        Route::patch('/{note}/unarchive', [NoteController::class, 'unarchive'])->name('unarchive');

        Route::get('/archived', [NoteController::class, 'archived'])->name('archived');

        Route::get('/trash', [NoteController::class, 'trash'])->name('trash');
        Route::patch('/{id}/restore', [NoteController::class, 'restore'])->name('restore');
        Route::delete('/{note}/force', [NoteController::class, 'forceDestroy'])->name('force-destroy');
    });
});

require __DIR__.'/auth.php';
