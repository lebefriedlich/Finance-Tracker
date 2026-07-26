<?php

namespace App\Traits;

use Illuminate\Http\Request;
use Carbon\Carbon;

trait DateRangeFilter
{
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
        $month = $request->input('month', date('Y-m'));
        $cycleStart = $user->cycle_start_date ?? 1;

        $startDate = Carbon::createFromFormat('Y-m', $month)->day($cycleStart)->startOfDay();
        
        // End date is one month later minus one day
        $endDate = $startDate->copy()->addMonth()->subDay()->endOfDay();

        return [$startDate, $endDate];
    }
}
