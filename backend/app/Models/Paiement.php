<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    protected $fillable = [
        'contrat_id','payeur_id','reference','montant','mode',
        'statut','transaction_id','libelle','periode','paye_at','recu_pdf',
    ];

    protected $casts = [
        'montant'  => 'decimal:2',
        'periode'  => 'date',
        'paye_at'  => 'datetime',
    ];

    public function contrat() { return $this->belongsTo(Contrat::class); }
    public function payeur()  { return $this->belongsTo(User::class, 'payeur_id'); }
}
