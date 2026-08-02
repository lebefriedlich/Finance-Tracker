<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Budget;
use App\Http\Requests\StoreBudgetRequest;
use App\Http\Requests\UpdateBudgetRequest;

class BudgetController extends Controller
{
    use \App\Traits\DateRangeFilter;

    public function index(Request $request)
    {
        $month = $request->input('month', $this->getDefaultMonth());
        $query = auth()->user()->budgets()->with('category')->where('month', $month);
        if ($search = $request->input('search')) {
            $query->whereHas('category', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }
        $budgets = $query->get();
        // Only expense categories can have budgets
        $categories = auth()->user()->categories()->where('type', 'expense')->get();

        return inertia('Budgets', [
            'budgets' => $budgets,
            'categories' => $categories,
            'filters' => [
                'month' => $month,
                'search' => $search
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'month' => 'required|string|size:7', // YYYY-MM
            'amount' => 'required|numeric|min:0',
        ]);
        
        $category = auth()->user()->categories()->findOrFail($validated['category_id']);
        if ($category->type !== 'expense') abort(400, 'Budgets only for expenses');

        auth()->user()->budgets()->updateOrCreate(
            ['category_id' => $validated['category_id'], 'month' => $validated['month']],
            ['amount' => $validated['amount']]
        );

        return redirect()->back();
    }

    public function update(Request $request, Budget $budget)
    {
        $this->authorize('update', $budget);
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'month' => 'required|string|size:7', // YYYY-MM
            'amount' => 'required|numeric|min:0',
        ]);
        
        $category = auth()->user()->categories()->findOrFail($validated['category_id']);
        if ($category->type !== 'expense') abort(400, 'Budgets only for expenses');

        $budget->update($validated);
        return redirect()->back();
    }

    public function destroy(Budget $budget)
    {
        $this->authorize('delete', $budget);
        $budget->delete();
        return redirect()->back();
    }
}
