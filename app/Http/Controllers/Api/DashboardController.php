<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

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
        $monthlyCashflow = $monthlyIncome - $monthlyExpense;

        // Categories with budget vs actual for this month
        $budgets = $user->budgets()->where('month', $month)->get()->keyBy('category_id');
        $categoryExpenses = $monthlyTransactions->where('type', 'expense')->groupBy('category_id');

        $budgetProgress = $user->categories()->where('type', 'expense')->get()->map(function ($cat) use ($budgets, $categoryExpenses) {
            $budgetAmount = $budgets->has($cat->id) ? $budgets[$cat->id]->amount : 0;
            $spentAmount = $categoryExpenses->has($cat->id) ? $categoryExpenses[$cat->id]->sum('amount') : 0;
            
            $status = 'ok';
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

        // Expense distribution
        $expenseChart = $categoryExpenses->map(function ($transactions, $catId) use ($user) {
            $cat = $user->categories()->find($catId);
            return [
                'name' => $cat ? $cat->name : 'Unknown',
                'amount' => $transactions->sum('amount')
            ];
        })->values();

        // Get user accounts
        $accounts = $user->accounts()->get();

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
                'startDate' => $startDate ? $startDate->toDateString() : null,
                'endDate' => $endDate ? $endDate->toDateString() : null,
                'month' => $month,
                'totalBalance' => $totalBalance,
                'monthlyIncome' => $monthlyIncome,
                'monthlyExpense' => $monthlyExpense,
                'monthlyCashflow' => $monthlyCashflow,
                'budgetProgress' => $budgetProgress,
                'expenseChart' => $expenseChart,
                'accounts' => $accounts,
                'recentTransactions' => $recentTransactions,
                'unreadNotificationsCount' => $unreadNotificationsCount
            ],
            'filters' => [
                'month' => $month,
                'start_date' => $request->input('start_date'),
                'end_date' => $request->input('end_date'),
            ]
        ]);
    }
}
