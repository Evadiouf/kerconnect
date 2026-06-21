<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Otp;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // ── Login
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $key = 'login:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return response()->json(['message' => 'Trop de tentatives. Réessayez dans 1 minute.'], 429);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            RateLimiter::hit($key, 60);
            return response()->json(['message' => 'Identifiants incorrects.'], 401);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Compte désactivé. Contactez le support.'], 403);
        }

        RateLimiter::clear($key);

        $token = $user->createToken('auth_token', ['*'], now()->addMinutes(15))->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
            'role'  => $user->role,
        ]);
    }

    // ── Register
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role'     => 'required|in:client,bailleur,proprietaire',
            'phone'    => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
            'phone'    => $request->phone,
        ]);

        // Envoyer OTP de vérification
        $this->generateAndSendOtp($user->email, 'verification');

        return response()->json([
            'message' => 'Compte créé. Vérifiez votre email pour le code OTP.',
            'user'    => $user,
        ], 201);
    }

    // ── Vérification OTP
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code'  => 'required|string|size:4',
            'type'  => 'required|in:verification,reset_password',
        ]);

        $key = 'otp:' . $request->email;
        if (RateLimiter::tooManyAttempts($key, 3)) {
            return response()->json(['message' => 'Trop de tentatives OTP. Demandez un nouveau code.'], 429);
        }

        $otp = Otp::where('email', $request->email)
            ->where('code', $request->code)
            ->where('type', $request->type)
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (!$otp) {
            RateLimiter::hit($key, 300);
            return response()->json(['message' => 'Code OTP invalide ou expiré.'], 422);
        }

        $otp->update(['used' => true]);
        RateLimiter::clear($key);

        if ($request->type === 'verification') {
            User::where('email', $request->email)->update(['email_verified_at' => now()]);
        }

        return response()->json(['message' => 'OTP vérifié avec succès.', 'verified' => true]);
    }

    // ── Renvoyer OTP
    public function resendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'type'  => 'required|in:verification,reset_password',
        ]);

        $this->generateAndSendOtp($request->email, $request->type);

        return response()->json(['message' => 'Nouveau code OTP envoyé.']);
    }

    // ── Mot de passe oublié
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email|exists:users,email']);
        $this->generateAndSendOtp($request->email, 'reset_password');
        return response()->json(['message' => 'Code OTP envoyé à votre email.']);
    }

    // ── Réinitialiser mot de passe
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email'                 => 'required|email|exists:users,email',
            'password'              => 'required|string|min:8|confirmed',
        ]);

        User::where('email', $request->email)->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
    }

    // ── Logout
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès.']);
    }

    // ── Utilisateur connecté
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    // ── Générer et envoyer OTP
    private function generateAndSendOtp(string $email, string $type): void
    {
        $code = str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);

        Otp::where('email', $email)->where('type', $type)->where('used', false)->delete();

        Otp::create([
            'email'      => $email,
            'code'       => $code,
            'type'       => $type,
            'expires_at' => now()->addMinutes(10),
        ]);

        Mail::raw(
            "Votre code KerConnect : {$code}\n\nCe code expire dans 10 minutes.",
            fn($msg) => $msg->to($email)->subject('Code de vérification KerConnect')
        );
    }
}
