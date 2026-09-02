<?php

namespace App\Observers;

use App\Models\Budget;
use Illuminate\Support\Facades\Cache;

class BudgetObserver
{
    private function clearCache(Budget $budget)
    {
        Cache::forget('budgets_user_' . $budget->user_id);
        Cache::increment('dashboard_version_user_' . $budget->user_id);
    }

    public function created(Budget $budget): void
    {
        $this->clearCache($budget);
    }

    public function updated(Budget $budget): void
    {
        $this->clearCache($budget);
    }

    public function deleted(Budget $budget): void
    {
        $this->clearCache($budget);
    }

    public function restored(Budget $budget): void
    {
        $this->clearCache($budget);
    }

    public function forceDeleted(Budget $budget): void
    {
        $this->clearCache($budget);
    }
}
