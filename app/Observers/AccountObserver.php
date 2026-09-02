<?php

namespace App\Observers;

use App\Models\Account;
use Illuminate\Support\Facades\Cache;

class AccountObserver
{
    private function clearCache(Account $account)
    {
        Cache::forget('accounts_user_' . $account->user_id);
        Cache::increment('dashboard_version_user_' . $account->user_id);
    }

    public function created(Account $account): void
    {
        $this->clearCache($account);
    }

    public function updated(Account $account): void
    {
        $this->clearCache($account);
    }

    public function deleted(Account $account): void
    {
        $this->clearCache($account);
    }

    public function restored(Account $account): void
    {
        $this->clearCache($account);
    }

    public function forceDeleted(Account $account): void
    {
        $this->clearCache($account);
    }
}
