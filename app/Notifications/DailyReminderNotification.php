<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;
use NotificationChannels\Fcm\Resources\WebpushConfig;
use NotificationChannels\Fcm\Resources\WebpushFcmOptions;

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
        return [WebPushChannel::class, FcmChannel::class];
    }

    public function toWebPush($notifiable, $notification)
    {
        return (new WebPushMessage)
            ->title('Pengingat Harian 💰')
            ->icon('/favicon.svg')
            ->body('Jangan lupa catat pengeluaran atau pemasukan hari ini ya!');
    }

    public function toFcm($notifiable)
    {
        return (new FcmMessage(notification: new FcmNotification(
            title: 'Pengingat Harian 💰',
            image: '/favicon.svg',
            body: 'Jangan lupa catat pengeluaran atau pemasukan hari ini ya!',
        )))->custom([
            'webpush' => [
                'fcm_options' => [
                    'link' => url('/dashboard'),
                ],
            ],
        ]);
    }
}
