<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Notifications\DailyReminderNotification;
use Carbon\Carbon;

class SendDailyReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-daily-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send daily push notifications to users who haven\'t logged any transactions today';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today()->toDateString();

        // Get users who don't have any transaction for today
        $users = User::where('role', '!=', 'admin')
            ->whereDoesntHave('transactions', function ($query) use ($today) {
                $query->whereDate('date', $today);
            })->get();

        foreach ($users as $user) {
            if ($user->pushSubscriptions()->count() > 0) {
                $user->notify(new DailyReminderNotification());
            }
        }

        $this->info('Daily reminders sent to ' . $users->count() . ' users.');
    }
}
