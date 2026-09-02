<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AccountController extends Controller
{
    /**
     * Display a listing of the accounts.
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $accounts = Cache::rememberForever('accounts_user_' . $userId, function () use ($request) {
            return $request->user()->accounts()->orderBy('name')->get();
        });

        return response()->json([
            'status' => 'success',
            'data' => $accounts
        ]);
    }

    /**
     * Store a newly created account in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:cash,bank,e-wallet',
            'balance' => 'required|numeric',
        ]);

        $account = $request->user()->accounts()->create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Account created successfully',
            'data' => $account
        ], 201);
    }

    /**
     * Display the specified account.
     */
    public function show(Request $request, Account $account)
    {
        if ($account->user_id !== $request->user()->id) abort(403);

        return response()->json([
            'status' => 'success',
            'data' => $account
        ]);
    }

    /**
     * Update the specified account in storage.
     */
    public function update(Request $request, Account $account)
    {
        if ($account->user_id !== $request->user()->id) abort(403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:cash,bank,e-wallet',
            'balance' => 'required|numeric',
        ]);

        $account->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Account updated successfully',
            'data' => $account
        ]);
    }

    /**
     * Remove the specified account from storage.
     */
    public function destroy(Request $request, Account $account)
    {
        if ($account->user_id !== $request->user()->id) abort(403);

        $account->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Account deleted successfully'
        ]);
    }
}
