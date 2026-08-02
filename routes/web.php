<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Shared profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Push Subscription
    Route::post('/push-subscribe', [\App\Http\Controllers\PushSubscriptionController::class, 'store'])->name('push.subscribe');

    // Owner Routes
    Route::middleware(['role:owner'])->prefix('admin')->name('admin.')->group(function () {
        Route::resource('users', \App\Http\Controllers\Admin\UserController::class);
    });

    // User Routes
    Route::middleware(['role:user'])->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
        Route::get('/dashboard/export', [\App\Http\Controllers\DashboardController::class, 'export'])->name('dashboard.export');
        Route::resource('categories', \App\Http\Controllers\CategoryController::class);
        Route::get('/transactions/export', [\App\Http\Controllers\TransactionController::class, 'export'])->name('transactions.export');
        Route::resource('transactions', \App\Http\Controllers\TransactionController::class);
        Route::resource('budgets', \App\Http\Controllers\BudgetController::class);
    });
});

require __DIR__.'/auth.php';
