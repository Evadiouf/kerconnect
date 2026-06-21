<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function update(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'name'  => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        $request->user()->update($request->only(['name', 'phone']));

        return response()->json(['message' => 'Profil mis à jour.', 'user' => $request->user()->fresh()]);
    }

    public function changePassword(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'current_password'  => 'required|string',
            'password'          => 'required|string|min:8|confirmed',
        ]);

        if (!\Illuminate\Support\Facades\Hash::check($request->current_password, $request->user()->password)) {
            return response()->json(['message' => 'Mot de passe actuel incorrect.'], 422);
        }

        $request->user()->update(['password' => \Illuminate\Support\Facades\Hash::make($request->password)]);

        return response()->json(['message' => 'Mot de passe modifié avec succès.']);
    }
}
