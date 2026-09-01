<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * tasks.project_id, tasks.period_id and tasks.parent_task_id all cascade on
 * delete, so a single hard delete used to take whole swathes of history with
 * it — a project took every task ever tagged to it, a period took its tasks
 * and its generated reports, and a chain's first task took every carry-over.
 *
 * Soft deletes turn those deletes into updates, so the DELETE statement that
 * fires the cascade never runs. The foreign keys are left exactly as they are.
 */
return new class extends Migration
{
    private const TABLES = ['tasks', 'projects', 'periods'];

    public function up(): void
    {
        foreach (self::TABLES as $table) {
            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->softDeletes();
            });
        }
    }

    public function down(): void
    {
        foreach (self::TABLES as $table) {
            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->dropSoftDeletes();
            });
        }
    }
};
