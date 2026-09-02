<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Transaction;

class TransactionController extends Controller
{
    use \App\Traits\DateRangeFilter;

    public function index(Request $request)
    {
        [$startDate, $endDate] = $this->getDateRange($request);
        $search = $request->input('search');
        $page = $request->input('page', 1);
        $month = $request->input('month', $this->getDefaultMonth());
        $userId = $request->user()->id;

        $version = \Illuminate\Support\Facades\Cache::get('dashboard_version_user_' . $userId, 1);
        $startDateStr = $startDate ? $startDate->toDateString() : 'null';
        $endDateStr = $endDate ? $endDate->toDateString() : 'null';
        $searchStr = $search ? md5($search) : 'none';

        $cacheKey = "transactions_user_{$userId}_p_{$page}_s_{$searchStr}_d1_{$startDateStr}_d2_{$endDateStr}_v_{$version}";

        $responseData = \Illuminate\Support\Facades\Cache::remember($cacheKey, 60 * 24, function () use ($request, $startDate, $endDate, $search, $month) {
            $query = $request->user()->transactions()->with(['category', 'account']);

            if ($startDate) $query->whereDate('date', '>=', $startDate);
            if ($endDate) $query->whereDate('date', '<=', $endDate);

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('description', 'like', "%{$search}%")
                        ->orWhereHas('category', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('account', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        });
                });
            }

            $datesQuery = clone $query;
            $datesQuery->setEagerLoads([]);

            // 1. Hitung total "tanggal unik" secara eksplisit
            $totalDates = (clone $datesQuery)
                ->distinct()
                ->count(DB::raw('DATE(date)'));

            // 2. Ambil tanggal untuk halaman saat ini secara manual menggunakan limit & offset
            $dates = $datesQuery->select(DB::raw('DATE(date) as date_group'))
                ->distinct()
                ->orderBy('date_group', 'desc')
                ->offset(($page - 1) * 7)
                ->limit(7)
                ->get();

            // 3. Buat objek Paginator manual
            $datesPaginator = new \Illuminate\Pagination\LengthAwarePaginator(
                $dates, 
                $totalDates, 
                7, 
                $page, 
                ['path' => request()->url(), 'query' => request()->query()]
            );

            // 4. Ambil transaksinya untuk tanggal-tanggal yang didapat
            $transactions = $query->whereIn(DB::raw('DATE(date)'), $dates->pluck('date_group'))
                ->orderBy('date', 'desc')
                ->orderBy('id', 'desc')
                ->get();

            // 5. Masukkan kumpulan transaksi ke paginator
            $datesPaginator->setCollection($transactions);

            return [
                'status' => 'success',
                'data' => $datesPaginator,
                'filters' => [
                    'month' => $month,
                    'start_date' => $request->input('start_date'),
                    'end_date' => $request->input('end_date'),
                    'search' => $search
                ]
            ];
        });

        return response()->json($responseData, 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'account_id' => 'required|exists:accounts,id',
            'date' => 'required|date',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
        ]);

        $category = $request->user()->categories()->findOrFail($validated['category_id']);
        if ($category->type !== $validated['type']) {
            return response()->json(['status' => 'error', 'message' => 'Type mismatch'], 400);
        }

        $account = $request->user()->accounts()->findOrFail($validated['account_id']);

        $transaction = DB::transaction(function () use ($request, $validated, $account) {
            $transaction = $request->user()->transactions()->create($validated);

            if ($transaction->type === 'income') {
                $account->increment('balance', $transaction->amount);
            } else {
                $account->decrement('balance', $transaction->amount);
            }

            return $transaction;
        });

        $this->checkBudgetAlert($transaction);

        return response()->json([
            'status' => 'success',
            'message' => 'Transaction data successfully added.',
            'data' => $transaction->load(['category', 'account'])
        ], 201);
    }

    public function show(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== $request->user()->id) abort(403);

        return response()->json([
            'status' => 'success',
            'data' => $transaction->load(['category', 'account'])
        ]);
    }

    public function update(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== $request->user()->id) abort(403);

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'account_id' => 'required|exists:accounts,id',
            'date' => 'required|date',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
        ]);

        $category = $request->user()->categories()->findOrFail($validated['category_id']);
        if ($category->type !== $validated['type']) {
            return response()->json(['status' => 'error', 'message' => 'Type mismatch'], 400);
        }

        $newAccount = $request->user()->accounts()->findOrFail($validated['account_id']);

        DB::transaction(function () use ($transaction, $validated, $newAccount) {
            $oldAmount = $transaction->amount;
            $oldType = $transaction->type;
            $oldAccount = $transaction->account;

            if ($oldAccount) {
                if ($oldType === 'income') {
                    $oldAccount->decrement('balance', $oldAmount);
                } else {
                    $oldAccount->increment('balance', $oldAmount);
                }
            }

            $transaction->update($validated);

            if ($transaction->type === 'income') {
                $newAccount->increment('balance', $transaction->amount);
            } else {
                $newAccount->decrement('balance', $transaction->amount);
            }
        });

        $this->checkBudgetAlert($transaction);

        return response()->json([
            'status' => 'success',
            'message' => 'Transaction data successfully updated',
            'data' => $transaction->load(['category', 'account'])
        ]);
    }

    public function destroy(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== $request->user()->id) abort(403);

        DB::transaction(function () use ($transaction) {
            $account = $transaction->account;

            if ($account) {
                if ($transaction->type === 'income') {
                    $account->decrement('balance', $transaction->amount);
                } else {
                    $account->increment('balance', $transaction->amount);
                }
            }

            $transaction->delete();
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Transaction data successfully deleted'
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
