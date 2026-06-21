<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Demande extends Model
{
    protected $fillable = [
        'bien_id','demandeur_id','type','statut','prenom_nom','telephone',
        'description','date_emmenagement','duree_souhaitee',
        'date_visite','heure_visite','cni_passeport','documents',
    ];

    protected $casts = [
        'documents'        => 'array',
        'date_emmenagement' => 'date',
        'date_visite'      => 'date',
    ];

    public function bien()      { return $this->belongsTo(Bien::class); }
    public function demandeur() { return $this->belongsTo(User::class, 'demandeur_id'); }
    public function contrat()   { return $this->hasOne(Contrat::class); }
}
