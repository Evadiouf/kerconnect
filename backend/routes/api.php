<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BienController;
use App\Http\Controllers\Api\ContratController;
use App\Http\Controllers\Api\DemandeController;
use App\Http\Controllers\Api\FavoriController;
use App\Http\Controllers\Api\PaiementController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// ── Webhook PayDunya (public, pas d'auth)
Route::post('/v1/paiements/webhook', [PaiementController::class, 'webhook']);

// ── Routes publiques Auth
Route::prefix('v1/auth')->group(function () {
    Route::post('/login',           [AuthController::class, 'login']);
    Route::post('/register',        [AuthController::class, 'register']);
    Route::post('/verify-otp',      [AuthController::class, 'verifyOtp']);
    Route::post('/resend-otp',      [AuthController::class, 'resendOtp']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password',  [AuthController::class, 'resetPassword']);
});

// ── Routes publiques Biens (catalogue)
Route::prefix('v1')->group(function () {
    Route::get('/biens',      [BienController::class, 'index']);
    Route::get('/biens/{id}', [BienController::class, 'show']);
});

// ── Routes protégées
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::get('/me',      [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Contrats (bailleur + client)
    Route::post('/contrats',              [ContratController::class, 'store']);
    Route::get('/contrats/{id}',          [ContratController::class, 'show']);
    Route::post('/contrats/{id}/signer',  [ContratController::class, 'signer']);

    // Paiements
    Route::post('/paiements',                        [PaiementController::class, 'initier']);
    Route::post('/paiements/{id}/confirmer',         [PaiementController::class, 'confirmer']);
    Route::get('/paiements/{id}/recu',               [PaiementController::class, 'recu']);
    Route::get('/contrats/{contratId}/paiements',    [PaiementController::class, 'historique']);

    // Compte utilisateur (tous rôles)
    Route::put('/account',                   [UserController::class, 'update']);
    Route::put('/account/password',          [UserController::class, 'changePassword']);

    // Favoris (tous rôles)
    Route::get('/favoris',                   [FavoriController::class, 'index']);
    Route::post('/favoris/toggle',           [FavoriController::class, 'toggle']);
    Route::get('/favoris/check/{bienId}',    [FavoriController::class, 'check']);

    // Espace client
    Route::middleware('role:client')->prefix('client')->group(function () {
        Route::get('/demandes',            [DemandeController::class, 'mesDemandes']);
        Route::post('/demandes',           [DemandeController::class, 'store']);
        Route::get('/demandes/{id}',       [DemandeController::class, 'show']);
        Route::get('/biens',               [BienController::class, 'index']);
    });

    // Espace bailleur
    Route::middleware('role:bailleur,proprietaire')->prefix('bailleur')->group(function () {
        Route::get('/biens',               [BienController::class, 'mesBiens']);
        Route::post('/biens',              [BienController::class, 'store']);
        Route::put('/biens/{id}',          [BienController::class, 'update']);
        Route::delete('/biens/{id}',       [BienController::class, 'destroy']);
        Route::get('/demandes',            [DemandeController::class, 'demandesBailleur']);
        Route::get('/demandes/{id}',       [DemandeController::class, 'show']);
        Route::put('/demandes/{id}',       [DemandeController::class, 'update']);
        Route::post('/contrats',           [ContratController::class, 'store']);
    });

    // Espace admin
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard',              [\App\Http\Controllers\Api\AdminController::class, 'dashboard']);
        Route::get('/users',                  [\App\Http\Controllers\Api\AdminController::class, 'users']);
        Route::get('/users/{id}',             [\App\Http\Controllers\Api\AdminController::class, 'userDetail']);
        Route::put('/users/{id}/toggle',      [\App\Http\Controllers\Api\AdminController::class, 'toggleUser']);
        Route::get('/annonces',               [\App\Http\Controllers\Api\AdminController::class, 'annonces']);
        Route::put('/annonces/{id}/statut',   [\App\Http\Controllers\Api\AdminController::class, 'toggleAnnonce']);
        Route::get('/transactions',           [\App\Http\Controllers\Api\AdminController::class, 'transactions']);
    });
});
