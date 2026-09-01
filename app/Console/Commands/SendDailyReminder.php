<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Notifications\DailyReminderNotification;
use Carbon\Carbon;

class SendDailyReminder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-daily-reminder';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send daily reminder to users who have not recorded transactions today';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::now('Asia/Jakarta')->toDateString();
        
        $users = User::whereNotNull('fcm_token')->get();
        $count = 0;

        foreach ($users as $user) {
            $hasTransactionToday = $user->transactions()->whereDate('date', $today)->exists();

            if (!$hasTransactionToday) {
                $user->notify(new DailyReminderNotification());
                $count++;
            }
        }

        $this->info("Daily reminder sent to $count users.");
    }
}
