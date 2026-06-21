<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contrat extends Model
{
    protected $fillable = [
        'demande_id','bien_id','bailleur_id','locataire_id','numero','type',
        'montant','date_debut','date_fin','fichier_contrat',
        'signature_bailleur','signature_locataire',
        'signe_bailleur_at','signe_locataire_at','statut',
    ];

    protected $casts = [
        'date_debut'         => 'date',
        'date_fin'           => 'date',
        'signe_bailleur_at'  => 'datetime',
        'signe_locataire_at' => 'datetime',
        'montant'            => 'decimal:2',
    ];

    public function demande()   { return $this->belongsTo(Demande::class); }
    public function bien()      { return $this->belongsTo(Bien::class); }
    public function bailleur()  { return $this->belongsTo(User::class, 'bailleur_id'); }
    public function locataire() { return $this->belongsTo(User::class, 'locataire_id'); }
    public function paiements() { return $this->hasMany(Paiement::class); }
}
