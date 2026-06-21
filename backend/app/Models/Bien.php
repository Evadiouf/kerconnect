<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bien extends Model
{
    protected $fillable = [
        'user_id','titre','type','nature','prix','description',
        'adresse','ville','surface','chambres','salles_bain',
        'equipements','images','video','contrat_modele','statut','is_new',
    ];

    protected $casts = [
        'equipements' => 'array',
        'images'      => 'array',
        'is_new'      => 'boolean',
        'prix'        => 'decimal:2',
        'surface'     => 'decimal:2',
    ];

    public function bailleur() { return $this->belongsTo(User::class, 'user_id'); }
    public function demandes() { return $this->hasMany(Demande::class); }
    public function contrats() { return $this->hasMany(Contrat::class); }
}
