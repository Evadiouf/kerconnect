<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Alerte extends Model
{
    protected $fillable = ['user_id', 'ville', 'nature', 'prix_max', 'type_bien', 'active'];
    protected $casts    = ['active' => 'boolean', 'prix_max' => 'decimal:2'];

    public function user() { return $this->belongsTo(User::class); }
}
