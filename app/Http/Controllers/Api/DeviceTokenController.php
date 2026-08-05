<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DeviceTokenController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'token' => 'required|string', // FCM or Expo Token
        ]);

        $user = auth()->user();
        
        // Simpan token mobile di tabel push_subscriptions
        // Kita menggunakan parameter token sebagai endpoint
        $user->updatePushSubscription($request->token, null, null);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Device token berhasil disimpan'
        ], 200);
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'token' => 'required|string'
        ]);

        $user = auth()->user();
        $user->deletePushSubscription($request->token);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Device token berhasil dihapus'
        ], 200);
    }
}
