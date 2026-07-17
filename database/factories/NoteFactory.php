<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Note>
 */
class NoteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => $this->faker->sentence(4),
            'content' => $this->faker->optional()->paragraph(),
            'color' => '#ffffff',
            'is_pinned' => false,
            'is_archived' => false,
        ];
    }

    public function pinned(): static
    {
        return $this->state(fn () => ['is_pinned' => true]);
    }

    public function archived(): static
    {
        return $this->state(fn () => ['is_archived' => true]);
    }
}
