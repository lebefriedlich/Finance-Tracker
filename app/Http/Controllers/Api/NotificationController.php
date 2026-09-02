<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $notifications = $user->notifications()
            ->latest()
            ->take(20)
            ->get()
            ->map(function ($notif) {
                return [
                    'id' => $notif->id,
                    'data' => $notif->data,
                    'read_at' => $notif->read_at,
                    'created_at' => $notif->created_at,
                ];
            });
            
        $unreadCount = $user->unreadNotifications()->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'unread_count' => $unreadCount,
                'notifications' => $notifications
            ]
        ]);
    }

    public function markAsRead(Request $request, $id = null)
    {
        $user = $request->user();

        if ($id) {
            $notification = $user->notifications()->where('id', $id)->first();
            if ($notification) {
                $notification->markAsRead();
            }
        } else {
            $user->unreadNotifications->markAsRead();
        }

        \Illuminate\Support\Facades\Cache::increment('dashboard_version_user_' . $user->id);

        return response()->json([
            'status' => 'success',
            'message' => 'Notification(s) marked as read'
        ]);
    }
}
