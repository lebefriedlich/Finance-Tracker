<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $month = $request->input('month', date('Y-m'));

        $lifetimeIncome = $user->transactions()->where('type', 'income')->sum('amount');
        $lifetimeExpense = $user->transactions()->where('type', 'expense')->sum('amount');
        $totalBalance = $lifetimeIncome - $lifetimeExpense;

        $monthlyTransactions = $user->transactions()
            ->where('date', 'like', $month . '%')
            ->get();

        $monthlyIncome = $monthlyTransactions->where('type', 'income')->sum('amount');
        $monthlyExpense = $monthlyTransactions->where('type', 'expense')->sum('amount');
        $monthlyCashflow = $monthlyIncome - $monthlyExpense;

        // Categories with budget vs actual for this month
        $budgets = $user->budgets()->where('month', $month)->get()->keyBy('category_id');
        $categoryExpenses = $monthlyTransactions->where('type', 'expense')->groupBy('category_id');

        $budgetProgress = $user->categories()->where('type', 'expense')->get()->map(function ($cat) use ($budgets, $categoryExpenses) {
            $budgetAmount = $budgets->has($cat->id) ? $budgets[$cat->id]->amount : 0;
            $spentAmount = $categoryExpenses->has($cat->id) ? $categoryExpenses[$cat->id]->sum('amount') : 0;
            return [
                'id' => $cat->id,
                'name' => $cat->name,
                'budget' => $budgetAmount,
                'spent' => $spentAmount,
                'status' => $spentAmount > $budgetAmount && $budgetAmount > 0 ? 'over' : 'ok',
            ];
        });

        // Expense distribution
        $expenseChart = $categoryExpenses->map(function ($transactions, $catId) use ($user) {
            $cat = $user->categories()->find($catId);
            return [
                'name' => $cat ? $cat->name : 'Unknown',
                'amount' => $transactions->sum('amount')
            ];
        })->values();

        $recentTransactions = $user->transactions()
            ->with('category')
            ->orderBy('date', 'desc')
            ->take(10)
            ->get();

        return inertia('Dashboard', [
            'stats' => [
                'totalBalance' => $totalBalance,
                'monthlyIncome' => $monthlyIncome,
                'monthlyExpense' => $monthlyExpense,
                'monthlyCashflow' => $monthlyCashflow,
            ],
            'budgetProgress' => $budgetProgress,
            'expenseChart' => $expenseChart,
            'recentTransactions' => $recentTransactions,
            'filters' => ['month' => $month]
        ]);
    }
}
