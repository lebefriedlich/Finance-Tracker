<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use NotificationChannels\Fcm\FcmChannel;
use NotificationChannels\Fcm\FcmMessage;
use NotificationChannels\Fcm\Resources\Notification as FcmNotification;

class TransactionSavedNotification extends Notification
{
    use Queueable;

    public $transaction;

    /**
     * Create a new notification instance.
     */
    public function __construct($transaction)
    {
        $this->transaction = $transaction;
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
        $typeLabel = $this->transaction->type === 'income' ? 'Incoming funds' : 'Expense';
        $accountName = $this->transaction->account ? $this->transaction->account->name : 'other source';
        $formattedAmount = 'Rp ' . number_format($this->transaction->amount, 0, ',', '.');
        
        $title = $this->transaction->type === 'income' ? 'Yay! Income Received 🎉' : 'Expense Recorded 💸';
        
        if ($this->transaction->type === 'income') {
            $message = "Yay! $typeLabel of $formattedAmount into $accountName.";
        } else {
            $message = "$typeLabel of $formattedAmount from $accountName.";
        }

        return (new FcmMessage(notification: new FcmNotification(
                title: $title,
                body: $message,
            )))
            ->data(['transaction_id' => (string) $this->transaction->id])
            ->android([
                'notification' => [
                    'channel_id' => 'coin_channel',
                    'sound' => 'coin.wav',
                    'color' => '#00FF00',
                ],
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $typeLabel = $this->transaction->type === 'income' ? 'Incoming funds' : 'Expense';
        $accountName = $this->transaction->account ? $this->transaction->account->name : 'other source';
        $formattedAmount = 'Rp ' . number_format($this->transaction->amount, 0, ',', '.');
        
        $title = $this->transaction->type === 'income' ? 'Yay! Income Received 🎉' : 'Expense Recorded 💸';
        
        if ($this->transaction->type === 'income') {
            $message = "Yay! $typeLabel of $formattedAmount into $accountName.";
        } else {
            $message = "$typeLabel of $formattedAmount from $accountName.";
        }

        return [
            'title' => $title,
            'message' => $message,
            'type' => 'transaction_saved',
            'transaction_id' => $this->transaction->id,
            'transaction_type' => $this->transaction->type,
            'amount' => $this->transaction->amount,
        ];
    }
}
