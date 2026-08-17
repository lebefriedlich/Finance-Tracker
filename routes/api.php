<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\DeviceTokenController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // Dashboard Stats
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Profile Management
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    Route::name('api.')->group(function () {
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('budgets', BudgetController::class);
        Route::apiResource('accounts', AccountController::class);
        Route::apiResource('transactions', TransactionController::class);
    });

    // Owner Routes
    Route::middleware(['role:owner'])->prefix('admin')->name('api.admin.')->group(function () {
        Route::apiResource('users', UserController::class);
    });
});
