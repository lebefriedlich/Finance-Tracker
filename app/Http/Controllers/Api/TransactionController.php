<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;

class TransactionController extends Controller
{
    use \App\Traits\DateRangeFilter;

    public function index(Request $request)
    {
        [$startDate, $endDate] = $this->getDateRange($request);
        
        $query = $request->user()->transactions()->with('category');
        
        if ($startDate) $query->whereDate('date', '>=', $startDate);
        if ($endDate) $query->whereDate('date', '<=', $endDate);

        if ($search = $request->input('search')) {
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhereHas('category', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $transactions = $query->orderBy('date', 'desc')->paginate(15)->withQueryString();

        return response()->json([
            'status' => 'success',
            'data' => $transactions,
            'filters' => [
                'month' => $request->input('month', $this->getDefaultMonth()),
                'start_date' => $request->input('start_date'),
                'end_date' => $request->input('end_date'),
                'search' => $search
            ]
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'date' => 'required|date',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
        ]);

        $category = $request->user()->categories()->findOrFail($validated['category_id']);
        if ($category->type !== $validated['type']) {
            return response()->json(['status' => 'error', 'message' => 'Type mismatch'], 400);
        }

        $transaction = $request->user()->transactions()->create($validated);

        $this->checkBudgetAlert($transaction);

        return response()->json([
            'status' => 'success',
            'message' => 'Data transaksi berhasil ditambahkan',
            'data' => $transaction
        ], 201);
    }

    public function show(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== $request->user()->id) abort(403);

        return response()->json([
            'status' => 'success',
            'data' => $transaction->load('category')
        ]);
    }

    public function update(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== $request->user()->id) abort(403);

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'date' => 'required|date',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
        ]);

        $category = $request->user()->categories()->findOrFail($validated['category_id']);
        if ($category->type !== $validated['type']) {
            return response()->json(['status' => 'error', 'message' => 'Type mismatch'], 400);
        }

        $transaction->update($validated);

        $this->checkBudgetAlert($transaction);

        return response()->json([
            'status' => 'success',
            'message' => 'Data transaksi berhasil diperbarui',
            'data' => $transaction
        ]);
    }

    public function destroy(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== $request->user()->id) abort(403);

        $transaction->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Data transaksi berhasil dihapus'
        ]);
    }

    private function checkBudgetAlert(Transaction $transaction)
    {
        if ($transaction->type !== 'expense') return;

        $month = substr($transaction->date, 0, 7);
        $user = auth()->user();
        
        $budget = $user->budgets()->where('category_id', $transaction->category_id)
            ->where('month', $month)->first();

        if (!$budget || $budget->amount <= 0) return;

        $request = new \Illuminate\Http\Request();
        $request->merge(['month' => $month]);
        [$startDate, $endDate] = $this->getDateRange($request);
        
        $totalSpent = $user->transactions()
            ->where('category_id', $transaction->category_id)
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('amount');
            
        $totalSpentBefore = $totalSpent - $transaction->amount;
        
        $percentage = ($totalSpent / $budget->amount) * 100;
        $percentageBefore = ($totalSpentBefore / $budget->amount) * 100;
        
        if ($percentage >= 100 && $percentageBefore < 100) {
            $user->notify(new \App\Notifications\BudgetAlertNotification($transaction->category->name, round($percentage)));
        } elseif ($percentage >= 80 && $percentage < 100 && $percentageBefore < 80) {
            $user->notify(new \App\Notifications\BudgetAlertNotification($transaction->category->name, round($percentage)));
        }
    }
}
