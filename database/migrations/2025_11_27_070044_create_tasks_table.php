<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('period_id')->constrained('periods', 'id')->onDelete('cascade');
            $table->foreignUuid('project_id')->nullable()->constrained('projects')->onDelete('cascade');
            $table->date('task_date');
            $table->string('title');
            $table->text('description')->nullable();
            $table->text('notes')->nullable()->comment('This for note or sub task');
            $table->string('status')->default(\App\Enum\StatusEnum::TODO);
            $table->string('priority')->default(\App\Enum\PriorityEnum::LOW);
            $table->integer('story_points')->nullable();
            $table->string('link_pull_request')->nullable();
            $table->timestamps();

            $table->index(['period_id', 'task_date']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
