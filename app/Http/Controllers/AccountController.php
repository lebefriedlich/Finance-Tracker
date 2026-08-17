<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function index(Request $request)
    {
        $accounts = $request->user()->accounts()->orderBy('name')->get();

        return Inertia::render('Accounts', [
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:cash,bank,e-wallet',
            'balance' => 'required|numeric|min:0',
        ]);

        $request->user()->accounts()->create($validated);

        return redirect()->back()->with('success', 'Account created successfully.');
    }

    public function update(Request $request, Account $account)
    {
        if ($account->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:cash,bank,e-wallet',
            'balance' => 'required|numeric|min:0',
        ]);

        $account->update($validated);

        return redirect()->back()->with('success', 'Account updated successfully.');
    }

    public function destroy(Request $request, Account $account)
    {
        if ($account->user_id !== $request->user()->id) {
            abort(403);
        }

        $account->delete();

        return redirect()->back()->with('success', 'Account deleted successfully.');
    }
}
