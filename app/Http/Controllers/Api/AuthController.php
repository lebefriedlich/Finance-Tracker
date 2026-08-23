<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'remember' => 'nullable|boolean'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email or password is not match.'
            ], 401);
        }

        $expiresAt = $request->boolean('remember') ? null : now()->addHours(24);

        return response()->json([
            'status' => 'success',
            'message' => 'Login Success',
            'data' => [
                'token' => $user->createToken('auth', ['*'], $expiresAt)->plainTextToken,
                'user' => $user
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Logout Success'
        ]);
    }
}
