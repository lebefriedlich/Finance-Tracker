<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;
use NotificationChannels\WebPush\WebPushChannel;

class BudgetAlertNotification extends Notification
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
        return [WebPushChannel::class];
    }

    public function toWebPush($notifiable, $notification)
    {
        $message = "Awas, pengeluaran kategori '{$this->categoryName}' kamu sudah mencapai {$this->percentage}% dari budget bulan ini!";
        if ($this->percentage >= 100) {
            $message = "Oops! Kamu sudah melebihi budget '{$this->categoryName}' bulan ini. Yuk rem dulu pengeluarannya.";
        }

        return (new WebPushMessage)
            ->title('Peringatan Anggaran! 🚨')
            ->icon('/apple-touch-icon.png')
            ->body($message);
    }
}
