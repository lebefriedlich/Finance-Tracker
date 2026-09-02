<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Cache;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => $request->user()
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $user->update($validated);

        $this->clearCache($user->id);

        return response()->json([
            'status' => 'success',
            'message' => 'Profile successfully updated',
            'data' => $user
        ]);
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|current_password',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Password successfully updated'
        ]);
    }

    public function updateCycleStartDate(Request $request)
    {
        $validated = $request->validate([
            'cycle_start_date' => 'required|integer|min:1|max:31',
        ]);

        $request->user()->update($validated);

        $this->clearCache($request->user()->id);

        return response()->json([
            'status' => 'success',
            'message' => 'Cycle date successfully updated',
            'data' => $request->user()
        ]);
    }

    private function clearCache($userId)
    {
        Cache::forget('users_index');
        Cache::increment('dashboard_version_user_' . $userId);
    }
}
