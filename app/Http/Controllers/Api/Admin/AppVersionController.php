<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppVersion;
use Illuminate\Http\Request;

class AppVersionController extends Controller
{
    public function index()
    {
        $versions = AppVersion::orderBy('id', 'desc')->get();
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
        return response()->json([
            'message' => 'Version updated successfully',
            'data' => $appVersion
        ]);
    }

    public function destroy(AppVersion $appVersion)
    {
        $appVersion->delete();
        return response()->json([
            'message' => 'Version deleted successfully'
        ]);
    }

    public function latest()
    {
        $latest = AppVersion::orderBy('build_number', 'desc')->first();
        if (!$latest) {
            return response()->json([
                'message' => 'No versions found'
            ], 404);
        }
        return response()->json([
            'message' => 'Version details',
            'data' => $latest
        ]);
    }
}
