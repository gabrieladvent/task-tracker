<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NoteTag>
 */
class NoteTagFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->unique()->word(),
            'color' => '#6366f1',
        ];
    }
}
