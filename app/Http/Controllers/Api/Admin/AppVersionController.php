<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppVersion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AppVersionController extends Controller
{
    public function index()
    {
        $versions = Cache::rememberForever('app_versions_index', function () {
            return AppVersion::orderBy('id', 'desc')->get();
        });
        return response()->json([
            'message' => 'Version list',
            'data' => $versions
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'version' => 'required|string',
            'build_number' => 'required|integer',
            'is_force_update' => 'boolean',
            'description' => 'nullable|string',
            'download_url' => 'nullable|url|max:255',
        ]);

        $version = AppVersion::create($validated);
        
        $this->clearCache();

        return response()->json([
            'message' => 'Version created successfully',
            'data' => $version
        ], 201);
    }

    public function show(AppVersion $appVersion)
    {
        return response()->json([
            'message' => 'Version details',
            'data' => $appVersion
        ]);
    }

    public function update(Request $request, AppVersion $appVersion)
    {
        $validated = $request->validate([
            'version' => 'sometimes|required|string',
            'build_number' => 'sometimes|required|integer',
            'is_force_update' => 'boolean',
            'description' => 'nullable|string',
            'download_url' => 'nullable|url|max:255',
        ]);

        $appVersion->update($validated);
        
        $this->clearCache();

        return response()->json([
            'message' => 'Version updated successfully',
            'data' => $appVersion
        ]);
    }

    public function destroy(AppVersion $appVersion)
    {
        $appVersion->delete();
        
        $this->clearCache();

        return response()->json([
            'message' => 'Version deleted successfully'
        ]);
    }

    public function latest()
    {
        $latest = Cache::rememberForever('app_versions_latest', function () {
            return AppVersion::orderBy('build_number', 'desc')->first();
        });

        if (!$latest) {
            return response()->json([
                'message' => 'No versions found'
            ], 404);
        }
        return response()->json($latest);
    }

    private function clearCache()
    {
        Cache::forget('app_versions_index');
        Cache::forget('app_versions_latest');
    }
}

