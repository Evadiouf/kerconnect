<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Avis extends Model
{
    protected $fillable = ['contrat_id', 'auteur_id', 'cible_id', 'note', 'commentaire', 'type'];
    protected $casts    = ['note' => 'integer'];

    public function auteur()  { return $this->belongsTo(User::class, 'auteur_id'); }
    public function cible()   { return $this->belongsTo(User::class, 'cible_id'); }
    public function contrat() { return $this->belongsTo(Contrat::class); }
}
