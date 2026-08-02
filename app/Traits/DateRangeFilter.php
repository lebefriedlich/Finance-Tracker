<?php

namespace App\Traits;

use Illuminate\Http\Request;
use Carbon\Carbon;

trait DateRangeFilter
{
    public function getDefaultMonth()
    {
        $user = auth()->check() ? auth()->user() : null;
        if (!$user) return date('Y-m');

        $cycleStart = $user->cycle_start_date ?? 1;
        $today = Carbon::today();

        if ($cycleStart > 15) {
            // Cycle M starts at (M-1)-day and ends at M-(day-1)
            if ($today->day >= $cycleStart) {
                return $today->copy()->addMonth()->format('Y-m');
            } else {
                return $today->format('Y-m');
            }
        } else {
            // Cycle M starts at M-day and ends at (M+1)-(day-1)
            if ($today->day < $cycleStart) {
                return $today->copy()->subMonth()->format('Y-m');
            } else {
                return $today->format('Y-m');
            }
        }
    }

    public function getDateRange(Request $request)
    {
        $user = auth()->user();

        // If custom dates are explicitly provided
        if ($request->filled('start_date') || $request->filled('end_date')) {
            $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date'))->startOfDay() : null;
            $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date'))->endOfDay() : null;
            return [$startDate, $endDate];
        }

        // Otherwise use month and cycle_start_date
        $month = $request->input('month', $this->getDefaultMonth());
        $cycleStart = $user->cycle_start_date ?? 1;

        $date = Carbon::createFromFormat('Y-m', $month);

        if ($cycleStart > 15) {
            $startDate = $date->copy()->subMonth()->day($cycleStart)->startOfDay();
        } else {
            $startDate = $date->copy()->day($cycleStart)->startOfDay();
        }

        // End date is one month later minus one day
        $endDate = $startDate->copy()->addMonth()->subDay()->endOfDay();

        return [$startDate, $endDate];
    }
}
