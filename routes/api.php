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

// Public App Version
Route::get('/app-version/latest', [\App\Http\Controllers\AppVersionController::class, 'latest']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // Profile Management
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    // User Routes
    Route::middleware(['role:user'])->group(function () {
        // Dashboard Stats
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // FCM Token
        Route::post('/fcm-token', [DeviceTokenController::class, 'store']);
        Route::delete('/fcm-token', [DeviceTokenController::class, 'destroy']);

        Route::name('api.')->group(function () {
            Route::apiResource('categories', CategoryController::class);
            Route::apiResource('budgets', BudgetController::class);
            Route::apiResource('accounts', AccountController::class);
            Route::apiResource('transactions', TransactionController::class);

            // Notifications
            Route::get('notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
            Route::put('notifications/read/{id?}', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
        });
    });

    // Owner Routes
    Route::middleware(['role:owner'])->prefix('admin')->name('api.admin.')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::apiResource('app-versions', \App\Http\Controllers\AppVersionController::class);
    });
});
