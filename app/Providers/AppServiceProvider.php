<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\Category;
use App\Observers\AccountObserver;
use App\Observers\TransactionObserver;
use App\Observers\BudgetObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        
        Account::observe(AccountObserver::class);
        Transaction::observe(TransactionObserver::class);
        Budget::observe(BudgetObserver::class);
    }
}
