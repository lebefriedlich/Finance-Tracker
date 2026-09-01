<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DeviceTokenController extends Controller
{
    /**
     * Store or update the user's FCM token.
     */
    public function store(Request $request)
    {
        $request->validate([
            "fcm_token" => "required|string",
        ]);

        $user = $request->user();
        $user->fcm_token = $request->fcm_token;
        $user->save();

        return response()->json([
            "status" => "success",
            "message" => "FCM Token updated successfully",
        ]);
    }

    /**
     * Remove the user's FCM token (e.g. on logout).
     */
    public function destroy(Request $request)
    {
        $user = $request->user();
        $user->fcm_token = null;
        $user->save();

        return response()->json([
            "status" => "success",
            "message" => "FCM Token removed successfully",
        ]);
    }

    /**
     * Show the user's current FCM token.
     */
    public function show(Request $request)
    {
        $user = $request->user();

        return response()->json([
            "status" => "success",
            "data" => [
                "fcm_token" => $user->fcm_token
            ]
        ]);
    }
}
