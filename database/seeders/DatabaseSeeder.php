<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Owner',
            'email' => 'noval.akbar.906@gmail.com',
            'password' => bcrypt('password'),
            'role' => 'owner',
            'is_active' => true,
        ]);
    }
}
