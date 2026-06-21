<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Otp extends Model
{
    protected $fillable = ['email', 'code', 'type', 'attempts', 'used', 'expires_at'];

    protected $casts = [
        'used'       => 'boolean',
        'expires_at' => 'datetime',
    ];
}
