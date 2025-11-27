<?php

namespace Database\Factories;

use App\Enum\PriorityEnum;
use App\Enum\StatusEnum;
use App\Models\Period;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    public function definition(): array
    {
        return [
            'id' => $this->faker->uuid(),
            'period_id' => Period::factory(),
            'project_id' => Project::factory(),
            'task_date' => $this->faker->dateTimeBetween('-30 days', '+30 days'),
            'title' => $this->faker->sentence(),
            'description' => $this->faker->optional(0.6)->paragraph(),
            'status' => $this->faker->randomElement(StatusEnum::class),
            'priority' => $this->faker->randomElement(PriorityEnum::class),
            'story_points' => $this->faker->numberBetween(1, 8),
        ];
    }

    public function forPeriod(Period $period): static
    {
        return $this->state(function (array $attributes) use ($period) {
            $start = $period->start_date;
            $end = $period->end_date;
            $daysDiff = $start->diffInDays($end);

            return [
                'period_id' => $period->id,
                'task_date' => $start->copy()->addDays(rand(0, $daysDiff)),
            ];
        });
    }

    public function done(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'done',
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }
}
