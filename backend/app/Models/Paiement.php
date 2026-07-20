<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    protected $fillable = [
        'contrat_id','payeur_id','reference','montant','montant_base','caution_montant','mode',
        'statut','transaction_id','libelle','periode','paye_at','recu_pdf',
        'commission_taux','commission_montant','montant_net',
    ];

    protected $casts = [
        'montant'            => 'decimal:2',
        'montant_base'       => 'decimal:2',
        'caution_montant'    => 'decimal:2',
        'commission_montant' => 'decimal:2',
        'montant_net'        => 'decimal:2',
        'commission_taux'    => 'decimal:2',
        'periode'            => 'date',
        'paye_at'            => 'datetime',
    ];

    public function contrat() { return $this->belongsTo(Contrat::class); }
    public function payeur()  { return $this->belongsTo(User::class, 'payeur_id'); }
}
