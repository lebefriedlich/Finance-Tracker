<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Data user berhasil diambil',
            'data' => User::where('role', '!=', 'owner')->latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:owner,user',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'User berhasil ditambahkan',
            'data' => $user
        ], 201);
    }

    public function show(User $user)
    {
        return response()->json([
            'status' => 'success',
            'data' => $user
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => 'required|in:owner,user',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
        ]);

        if ($request->filled('password')) {
            $request->validate(['password' => 'required|string|min:8|confirmed']);
            $user->update(['password' => Hash::make($request->password)]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'User berhasil diperbarui',
            'data' => $user
        ]);
    }

    public function destroy(User $user)
    {
        if (auth()->id() === $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'User berhasil dihapus'
        ]);
    }
}
