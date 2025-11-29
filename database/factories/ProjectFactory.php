<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $projects = [
            'HRIS' => 'Human Resource Information System',
            'Kraken Onboarding' => 'This project is for the benefit of UAT new aggregators',
            'Kraken' => 'This project is for the integration of new aggregators and the core of all finance and engines.',
        ];

        $key = array_rand($projects);

        return [
            'name' => $key,
            'color' => $this->faker->hexColor(),
            'description' => $projects[$key],
        ];
    }
}
