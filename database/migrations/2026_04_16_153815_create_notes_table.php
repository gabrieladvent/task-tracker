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
        Schema::create('notes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->longText('content')->nullable();
            $table->string('color', 7)->default('#ffffff');
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_archived')->default(false);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['user_id', 'is_archived', 'is_pinned']);
            $table->index(['user_id', 'deleted_at']);
        });

        Schema::create('note_tags', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('color', 7)->default('#6366f1');
            $table->timestamps();

            $table->unique(['user_id', 'name']);
        });

        Schema::create('note_tag', function (Blueprint $table) {
            $table->foreignUuid('note_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('note_tag_id')->constrained()->cascadeOnDelete();

            $table->primary(['note_id', 'note_tag_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('note_tag');
        Schema::dropIfExists('note_tags');
        Schema::dropIfExists('notes');
    }
};
