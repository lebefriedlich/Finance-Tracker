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

class BudgetAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $categoryName;
    public $percentage;

    /**
     * Create a new notification instance.
     */
    public function __construct($categoryName, $percentage)
    {
        $this->categoryName = $categoryName;
        $this->percentage = $percentage;
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

    public function toWebPush($notifiable, $notification)
    {
        $message = "Awas, pengeluaran kategori '{$this->categoryName}' kamu sudah mencapai {$this->percentage}% dari budget bulan ini!";
        if ($this->percentage >= 100) {
            $message = "Oops! Kamu sudah melebihi budget '{$this->categoryName}' bulan ini. Yuk rem dulu pengeluarannya.";
        }

        return (new WebPushMessage)
            ->title('Peringatan Anggaran! 🚨')
            ->icon('/favicon.svg')
            ->body($message);
    }

    public function toFcm($notifiable)
    {
        $message = "Watch out, your spending in the '{$this->categoryName}' category has reached {$this->percentage}% of this month's budget!";
        if ($this->percentage >= 100) {
            $message = "Oops! You've exceeded your '{$this->categoryName}' budget for this month. Let's slow down on the spending.";
        }

        return (new FcmMessage(notification: new FcmNotification(
                title: 'Budget Alert! 🚨',
                body: $message,
            )))
            ->data(['category' => $this->categoryName, 'percentage' => (string) $this->percentage])
            ->android([
                'notification' => [
                    'channel_id' => 'alert_channel',
                    'sound' => 'alert.wav',
                    'color' => '#FF0000',
                ],
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $message = "Watch out, your spending in the '{$this->categoryName}' category has reached {$this->percentage}% of this month's budget!";
        if ($this->percentage >= 100) {
            $message = "Oops! You've exceeded your '{$this->categoryName}' budget for this month. Let's slow down on the spending.";
        }

        return [
            'title' => 'Budget Alert! 🚨',
            'message' => $message,
            'type' => 'budget_alert',
            'category' => $this->categoryName,
            'percentage' => $this->percentage,
        ];
    }
}
