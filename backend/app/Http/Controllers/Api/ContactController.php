<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nom'     => 'required|string|max:100',
            'email'   => 'required|email',
            'sujet'   => 'nullable|string|max:200',
            'message' => 'required|string|max:2000',
        ]);

        try {
            Mail::raw(
                "Nouveau message de conseil\n\nNom : {$request->nom}\nEmail : {$request->email}\nSujet : {$request->sujet}\n\n{$request->message}",
                function ($m) use ($request) {
                    $m->to(config('mail.admin_email', 'contact@naratechvision.com'))
                      ->subject('KerConnect : ' . ($request->sujet ?? 'Demande de conseil'))
                      ->replyTo($request->email, $request->nom);
                }
            );
        } catch (\Exception) {
            // Email non bloquant — on retourne quand même 200
        }

        return response()->json(['message' => 'Message reçu, nous vous répondrons très vite.']);
    }
}
