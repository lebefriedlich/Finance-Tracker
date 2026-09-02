<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    use \App\Traits\DateRangeFilter;

    public function index(Request $request)
    {
        $user = $request->user();
        [$startDate, $endDate] = $this->getDateRange($request);
        $month = $request->input('month', $this->getDefaultMonth());

        $totalBalance = $user->accounts()->sum('balance');

        $query = $user->transactions();
        if ($startDate) $query->whereDate('date', '>=', $startDate);
        if ($endDate) $query->whereDate('date', '<=', $endDate);
        
        $monthlyTransactions = $query->get();

        $monthlyIncome = $monthlyTransactions->where('type', 'income')->sum('amount');
        $monthlyExpense = $monthlyTransactions->where('type', 'expense')->sum('amount');

        // Categories with budget vs actual for this month
        if ($month === 'all') {
            $budgets = $user->budgets()->selectRaw('category_id, sum(amount) as amount')->groupBy('category_id')->get()->keyBy('category_id');
        } else {
            $budgets = $user->budgets()->where('month', $month)->get()->keyBy('category_id');
        }
        $categoryExpenses = $monthlyTransactions->where('type', 'expense')->groupBy('category_id');

        $budgetProgress = $user->categories()->where('type', 'expense')->get()->map(function ($cat) use ($budgets, $categoryExpenses) {
            $budgetAmount = $budgets->has($cat->id) ? $budgets[$cat->id]->amount : 0;
            $spentAmount = $categoryExpenses->has($cat->id) ? $categoryExpenses[$cat->id]->sum('amount') : 0;
            
            $status = 'safe';
            if ($budgetAmount == 0) $status = 'nobudget';
            elseif ($spentAmount > $budgetAmount) $status = 'over';
            elseif ($spentAmount == $budgetAmount) $status = 'empty';
            elseif ($spentAmount >= 0.8 * $budgetAmount) $status = 'warning';

            return [
                'id' => $cat->id,
                'name' => $cat->name,
                'budget' => $budgetAmount,
                'spent' => $spentAmount,
                'status' => $status,
            ];
        })->filter(function ($bp) {
            return $bp['budget'] > 0;
        })->values();

        $recentTransactions = $user->transactions()
            ->with('category')
            ->when($startDate, fn($q) => $q->whereDate('date', '>=', $startDate))
            ->when($endDate, fn($q) => $q->whereDate('date', '<=', $endDate))
            ->orderBy('date', 'desc')
            ->take(10)
            ->get();

        $unreadNotificationsCount = $user->unreadNotifications()->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'totalBalance' => $totalBalance,
                'monthlyIncome' => $monthlyIncome,
                'monthlyExpense' => $monthlyExpense,
                'budgetProgress' => $budgetProgress,
                'recentTransactions' => $recentTransactions,
                'unreadNotificationsCount' => $unreadNotificationsCount
            ]
        ]);
    }
}
