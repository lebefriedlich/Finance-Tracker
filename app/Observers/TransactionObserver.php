<?php

namespace App\Observers;

use App\Models\Transaction;
use Illuminate\Support\Facades\Cache;

class TransactionObserver
{
    private function clearRelatedCache(Transaction $transaction)
    {
        Cache::forget('accounts_user_' . $transaction->user_id);
        Cache::forget('budgets_user_' . $transaction->user_id);
        
        // Bump dashboard version for real-time updates
        Cache::increment('dashboard_version_user_' . $transaction->user_id);
    }

    public function created(Transaction $transaction): void
    {
        $this->clearRelatedCache($transaction);
    }

    public function updated(Transaction $transaction): void
    {
        $this->clearRelatedCache($transaction);
    }

    public function deleted(Transaction $transaction): void
    {
        $this->clearRelatedCache($transaction);
    }

    public function restored(Transaction $transaction): void
    {
        $this->clearRelatedCache($transaction);
    }

    public function forceDeleted(Transaction $transaction): void
    {
        $this->clearRelatedCache($transaction);
    }
}
