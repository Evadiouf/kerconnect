<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['cle', 'valeur', 'description'];

    public static function get(string $cle, mixed $default = null): mixed
    {
        $s = static::where('cle', $cle)->first();
        return $s ? $s->valeur : $default;
    }

    public static function set(string $cle, mixed $valeur, string $description = ''): void
    {
        static::updateOrCreate(['cle' => $cle], ['valeur' => $valeur, 'description' => $description]);
    }
}
