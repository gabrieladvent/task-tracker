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
        Schema::create('period_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('period_id')->constrained('periods', 'id')->onDelete('cascade');
            $table->string('report_name');
            $table->json('report_data');
            $table->integer('total_tasks');
            $table->integer('completed_tasks');
            $table->integer('total_story_points')->nullable();
            $table->timestamps();

            $table->index('period_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('period_reports');
    }
};
