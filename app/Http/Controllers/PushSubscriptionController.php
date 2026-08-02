<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    public function store(Request $request)
    {
        $this->validate($request, [
            'endpoint'    => 'required',
            'keys.auth'   => 'required',
            'keys.p256dh' => 'required'
        ]);

        $endpoint = $request->endpoint;
        $token = $request->keys['auth'];
        $key = $request->keys['p256dh'];
        
        $user = auth()->user();
        
        // This will create or update the subscription in the push_subscriptions table
        $user->updatePushSubscription($endpoint, $key, $token);
        
        return response()->json(['success' => true], 200);
    }

    public function destroy(Request $request)
    {
        $this->validate($request, [
            'endpoint' => 'required'
        ]);

        $user = auth()->user();
        $user->deletePushSubscription($request->endpoint);
        
        return response()->json(['success' => true], 200);
    }
}
