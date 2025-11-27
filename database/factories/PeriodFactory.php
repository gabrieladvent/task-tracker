<?php

namespace Database\Factories;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

class PeriodFactory extends Factory
{
    public function definition(): array
    {
        $startDate = Carbon::parse($this->faker->dateTimeBetween('-6 months', '+3 months'))
            ->day(21);

        $endDate = $startDate->copy()->addMonth()->day(20);

        return [
            'name' => null,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ];
    }

    public function withName(): static
    {
        return $this->state(function (array $attributes) {
            $start = Carbon::parse($attributes['start_date']);
            $end = Carbon::parse($attributes['end_date']);

            return [
                'name' => $start->format('M').' - '.$end->format('M Y'),
            ];
        });
    }

    public function current(): static
    {
        return $this->state(function (array $attributes) {
            $today = Carbon::today();
            $startDate = Carbon::create($today->year, $today->month, 21);

            if ($today->day < 21) {
                $startDate->subMonth();
            }

            $endDate = $startDate->copy()->addMonth()->day(20);

            return [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ];
        });
    }
}
