<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;

class TransactionController extends Controller
{
    use \App\Traits\DateRangeFilter;

    public function index(Request $request)
    {
        [$startDate, $endDate] = $this->getDateRange($request);
        
        $query = auth()->user()->transactions()->with('category');
        
        if ($startDate) $query->whereDate('date', '>=', $startDate);
        if ($endDate) $query->whereDate('date', '<=', $endDate);

        $transactions = $query->orderBy('date', 'desc')->paginate(15);

        $categories = auth()->user()->categories()->get();

        return inertia('Transactions', [
            'transactions' => $transactions,
            'categories' => $categories,
            'filters' => [
                'month' => $request->input('month', date('Y-m')),
                'start_date' => $request->input('start_date'),
                'end_date' => $request->input('end_date')
            ]
        ]);
    }

    public function export(Request $request)
    {
        [$startDate, $endDate] = $this->getDateRange($request);

        $filename = 'Transaksi_' . $startDate->format('Y-m-d') . '_sd_' . $endDate->format('Y-m-d') . '.xlsx';

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\TransactionsExport($startDate, $endDate),
            $filename
        );
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

        // Ensure category belongs to user
        $category = auth()->user()->categories()->findOrFail($validated['category_id']);
        if ($category->type !== $validated['type']) abort(400, 'Type mismatch');

        auth()->user()->transactions()->create($validated);
        return redirect()->back();
    }

    public function update(Request $request, Transaction $transaction)
    {
        $this->authorize('update', $transaction);
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'date' => 'required|date',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
        ]);

        $category = auth()->user()->categories()->findOrFail($validated['category_id']);
        if ($category->type !== $validated['type']) abort(400, 'Type mismatch');

        $transaction->update($validated);
        return redirect()->back();
    }

    public function destroy(Transaction $transaction)
    {
        $this->authorize('delete', $transaction);
        $transaction->delete();
        return redirect()->back();
    }
}
