<?php

namespace Database\Seeders;

use App\Models\Period;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PeriodSeeder extends Seeder
{
    public function run(): void
    {
        Period::factory()->current()->withName()->create();

        // Previous periods
        for ($i = 1; $i <= 5; $i++) {
            $startDate = Carbon::today()->subMonths($i)->day(21);
            $endDate = $startDate->copy()->addMonth()->day(20);

            Period::create([
                'start_date' => $startDate,
                'end_date' => $endDate,
                'name' => $startDate->format('M').' - '.$endDate->format('M Y'),
            ]);
        }

        // Future periods
        for ($i = 1; $i <= 2; $i++) {
            $startDate = Carbon::today()->addMonths($i)->day(21);
            $endDate = $startDate->copy()->addMonth()->day(20);

            Period::create([
                'start_date' => $startDate,
                'end_date' => $endDate,
                'name' => $startDate->format('M').' - '.$endDate->format('M Y'),
            ]);
        }
    }
}
