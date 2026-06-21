<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favori;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $favoris = Favori::with('bien:id,titre,type,nature,prix,adresse,ville,surface,chambres,is_new')
            ->where('user_id', $request->user()->id)->latest()->get();
        return response()->json($favoris);
    }

    public function toggle(Request $request): JsonResponse
    {
        $request->validate(['bien_id' => 'required|exists:biens,id']);
        $favori = Favori::where('user_id', $request->user()->id)->where('bien_id', $request->bien_id)->first();
        if ($favori) {
            $favori->delete();
            return response()->json(['liked' => false, 'message' => 'Retiré des favoris.']);
        }
        Favori::create(['user_id' => $request->user()->id, 'bien_id' => $request->bien_id]);
        return response()->json(['liked' => true, 'message' => 'Ajouté aux favoris.']);
    }

    public function check(Request $request, string $bienId): JsonResponse
    {
        $liked = Favori::where('user_id', $request->user()->id)->where('bien_id', $bienId)->exists();
        return response()->json(['liked' => $liked]);
    }
}
