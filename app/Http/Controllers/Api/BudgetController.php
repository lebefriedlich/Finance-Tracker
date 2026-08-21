<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Budget;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => $request->user()->budgets()->with('category')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0.01',
            'month' => 'required|string|size:7'
        ]);

        $category = $request->user()->categories()->findOrFail($validated['category_id']);
        if ($category->type !== 'expense') {
            return response()->json([
                'status' => 'error',
                'message' => 'Budget hanya bisa dibuat untuk kategori pengeluaran'
            ], 400);
        }

        $budget = $request->user()->budgets()->create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Budget berhasil ditambahkan',
            'data' => $budget
        ], 201);
    }

    public function show(Request $request, Budget $budget)
    {
        if ($budget->user_id !== $request->user()->id) abort(403);

        return response()->json([
            'status' => 'success',
            'data' => $budget->load('category')
        ]);
    }

    public function update(Request $request, Budget $budget)
    {
        if ($budget->user_id !== $request->user()->id) abort(403);

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0.01',
            'month' => 'required|string|size:7'
        ]);

        $category = $request->user()->categories()->findOrFail($validated['category_id']);
        if ($category->type !== 'expense') {
            return response()->json([
                'status' => 'error',
                'message' => 'Budget hanya bisa dibuat untuk kategori pengeluaran'
            ], 400);
        }

        $budget->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Budget berhasil diperbarui',
            'data' => $budget
        ]);
    }

    public function destroy(Request $request, Budget $budget)
    {
        if ($budget->user_id !== $request->user()->id) abort(403);

        $budget->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Budget berhasil dihapus'
        ]);
    }
}
