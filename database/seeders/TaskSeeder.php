<?php

namespace Database\Seeders;

use App\Models\Period;
use App\Models\Task;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    public function run(): void
    {
        $periods = Period::all();

        foreach ($periods as $period) {
            // Generate 15-30 tasks per period
            $taskCount = rand(15, 30);

            for ($i = 0; $i < $taskCount; $i++) {
                Task::factory()->forPeriod($period)->create();
            }
        }
    }
}
