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
        'ninea',
        'registre_commerce',
        'adresse_structure',
        'type_bien',
        'contrat_location',
        'is_active',
        'inscription_payee',
        'inscription_at',
        'verifie',
        'forfait',
        'forfait_expire_at',
        'starter_expire_at',
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
            'inscription_payee' => 'boolean',
            'inscription_at'    => 'datetime',
            'verifie'           => 'boolean',
            'forfait_expire_at'  => 'datetime',
            'starter_expire_at'  => 'datetime',
        ];
    }

    public function isAdmin(): bool        { return $this->role === 'admin'; }
    public function isBailleur(): bool     { return in_array($this->role, ['bailleur', 'proprietaire']); }
    public function isClient(): bool       { return $this->role === 'client'; }

    // Taux de commission KerConnect selon le forfait actif du bailleur
    public function tauxCommission(): float
    {
        $forfaitActif = $this->forfait;
        if ($forfaitActif !== 'starter' && $this->forfait_expire_at?->isPast()) {
            $forfaitActif = 'starter'; // forfait expiré → retour au starter
        }
        return match($forfaitActif) {
            'pro'    => 4.0,
            'agence' => 3.0,
            default  => 5.0,
        };
    }

    public function biens()    { return $this->hasMany(Bien::class); }
    public function demandes() { return $this->hasMany(Demande::class, 'demandeur_id'); }
    public function favoris()  { return $this->hasMany(Favori::class); }
}
