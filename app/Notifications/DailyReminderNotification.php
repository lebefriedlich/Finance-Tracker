<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;

class DailyReminderNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return [FcmChannel::class, 'database'];
    }

    public function toFcm($notifiable)
    {
        return (new FcmMessage(notification: new FcmNotification(
            title: "Don't forget to track your finances today! 📝",
            body: "Let's log your expenses or income today to keep your financial reports accurate.",
        )))
            ->data(['action' => 'open_app'])
            ->android([
                'notification' => [
                    'channel_id' => 'reminder_channel',
                    'sound' => 'reminder.wav',
                    'color' => '#FFA500',
                ],
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Daily Financial Tracking 📝',
            'message' => "Let's log your expenses or income today to keep your financial reports accurate.",
            'type' => 'daily_reminder',
        ];
    }
}
