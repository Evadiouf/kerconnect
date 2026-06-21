<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
        ];
    }

    public function isAdmin(): bool        { return $this->role === 'admin'; }
    public function isBailleur(): bool     { return in_array($this->role, ['bailleur', 'proprietaire']); }
    public function isClient(): bool       { return $this->role === 'client'; }

    public function biens()    { return $this->hasMany(Bien::class); }
    public function demandes() { return $this->hasMany(Demande::class, 'demandeur_id'); }
    public function favoris()  { return $this->hasMany(Favori::class); }
}
