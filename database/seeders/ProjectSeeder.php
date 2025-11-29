<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $projects = [
            [
                'name' => 'HRIS',
                'color' => '#FF5733',
                'description' => 'Human Resource Information System',
            ],
            [
                'name' => 'Kraken Onboarding',
                'color' => '#3498DB',
                'description' => 'This project is for the benefit of UAT new aggregators',
            ],
            [
                'name' => 'Kraken',
                'color' => '#2ECC71',
                'description' => 'This project is for the integration of new aggregators and the core of all finance and engines.',
            ],
        ];

        foreach ($projects as $project) {
            Project::create($project);
        }
    }
}
