<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppVersion extends Model
{
    protected $fillable = [
        'version',
        'build_number',
        'is_force_update',
        'description',
        'download_url',
    ];

    protected $casts = [
        'is_force_update' => 'boolean',
    ];
}
