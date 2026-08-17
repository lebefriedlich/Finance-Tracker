<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use \App\Traits\DateRangeFilter;

    private function getDashboardData(Request $request)
    {
        $user = $request->user();
        [$startDate, $endDate] = $this->getDateRange($request);
        $month = $request->input('month', $this->getDefaultMonth());

        $lifetimeIncome = $user->transactions()->where('type', 'income')->sum('amount');
        $lifetimeExpense = $user->transactions()->where('type', 'expense')->sum('amount');
        $totalBalance = $lifetimeIncome - $lifetimeExpense;

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
            return $bp['budget'] > 0 || $bp['spent'] > 0;
        })->values();

        // Expense distribution
        $expenseChart = $categoryExpenses->map(function ($transactions, $catId) use ($user) {
            $cat = $user->categories()->find($catId);
            return [
                'name' => $cat ? $cat->name : 'Unknown',
                'amount' => $transactions->sum('amount')
            ];
        })->values();

        $recentTransactions = $user->transactions()
            ->with(['category', 'account'])
            ->orderBy('date', 'desc')
            ->take(10)
            ->get();
            
        $accounts = $user->accounts()->orderBy('name')->get();

        return compact(
            'startDate', 'endDate', 'month', 'totalBalance', 'monthlyIncome', 'monthlyExpense',
            'monthlyCashflow', 'budgetProgress', 'expenseChart', 'recentTransactions', 'accounts'
        );
    }

    public function index(Request $request)
    {
        $data = $this->getDashboardData($request);
        
        return inertia('Dashboard', array_merge($data, [
            'filters' => [
                'month' => $data['month'],
                'start_date' => $request->input('start_date'),
                'end_date' => $request->input('end_date'),
            ]
        ]));
    }

    public function export(Request $request)
    {
        $data = $this->getDashboardData($request);
        
        $startStr = $data['startDate'] ? $data['startDate']->format('Y-m-d') : 'AllTime';
        $endStr = $data['endDate'] ? $data['endDate']->format('Y-m-d') : 'AllTime';
        
        $fileName = 'Laporan_Dashboard_' . $startStr . '_sd_' . $endStr . '.xlsx';
        
        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\DashboardExport(
                $data['startDate'],
                $data['endDate'],
                $data['budgetProgress'],
                $data['totalBalance'],
                $data['monthlyIncome'],
                $data['monthlyExpense']
            ),
            $fileName
        );
    }
}
