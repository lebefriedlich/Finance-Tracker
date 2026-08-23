<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppVersion;
use Illuminate\Http\Request;

class AppVersionController extends Controller
{
    public function index()
    {
        $appVersions = AppVersion::orderBy('build_number', 'desc')->paginate(15);
        return inertia('Admin/AppVersions', ['appVersions' => $appVersions]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'version' => 'required|string|max:50',
            'build_number' => 'required|integer',
            'is_force_update' => 'boolean',
            'description' => 'nullable|string',
            'download_url' => 'nullable|url|max:255',
        ]);

        AppVersion::create($validated);
        return redirect()->back();
    }

    public function update(Request $request, AppVersion $appVersion)
    {
        $validated = $request->validate([
            'version' => 'required|string|max:50',
            'build_number' => 'required|integer',
            'is_force_update' => 'boolean',
            'description' => 'nullable|string',
            'download_url' => 'nullable|url|max:255',
        ]);

        $appVersion->update($validated);
        return redirect()->back();
    }

    public function destroy(AppVersion $appVersion)
    {
        $appVersion->delete();
        return redirect()->back();
    }
}
