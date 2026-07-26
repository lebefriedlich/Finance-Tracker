<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = auth()->user()->categories()->orderBy('name')->get();
        return inertia('Categories', ['categories' => $categories]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
        ]);
        auth()->user()->categories()->create($validated);
        return redirect()->back();
    }

    public function update(Request $request, Category $category)
    {
        $this->authorize('update', $category);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
        ]);
        $category->update($validated);
        return redirect()->back();
    }

    public function destroy(Category $category)
    {
        $this->authorize('delete', $category);

        if ($category->transactions()->exists()) {
            return redirect()->back()->withErrors(['message' => 'Cannot delete category with active transactions.']);
        }
        $category->delete();
        return redirect()->back();
    }
}
