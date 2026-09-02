<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $categories = Cache::rememberForever('categories_user_' . $userId, function () use ($request) {
            return $request->user()->categories;
        });

        return response()->json([
            'status' => 'success',
            'data' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'type' => 'required|in:income,expense'
        ]);

        $category = $request->user()->categories()->create($validated);

        $this->clearCache();

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

        $this->clearCache();

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

        $this->clearCache();

        return response()->json([
            'status' => 'success',
            'message' => 'Category successfully deleted'
        ]);
    }

    private function clearCache()
    {
        $userId = auth()->id();
        Cache::forget('categories_user_' . $userId);
        Cache::increment('dashboard_version_user_' . $userId);
    }
}
