<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => $request->user()->categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'type' => 'required|in:income,expense'
        ]);

        $category = $request->user()->categories()->create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Category successfully added',
            'data' => $category
        ], 201);
    }

    public function show(Request $request, Category $category)
    {
        if ($category->user_id !== $request->user()->id) {
            abort(403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $category
        ]);
    }

    public function update(Request $request, Category $category)
    {
        if ($category->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'type' => 'required|in:income,expense'
        ]);

        $category->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Category successfully updated',
            'data' => $category
        ]);
    }

    public function destroy(Request $request, Category $category)
    {
        if ($category->user_id !== $request->user()->id) {
            abort(403);
        }

        $category->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Category successfully deleted'
        ]);
    }
}
