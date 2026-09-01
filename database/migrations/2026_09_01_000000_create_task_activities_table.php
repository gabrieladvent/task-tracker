<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_activities', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->uuid('root_task_id');
            $table->uuid('task_id')->nullable()->comment('The daily task row that triggered this event');

            $table->string('type');
            $table->string('field')->nullable();
            $table->json('from_value')->nullable();
            $table->json('to_value')->nullable();
            $table->date('task_date')->nullable();
            $table->timestamp('occurred_at');

            $table->index(['root_task_id', 'occurred_at']);
            $table->index('occurred_at');
            $table->index('task_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_activities');
    }
};
