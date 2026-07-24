# KerConnect — Guide complet pour Claude Code

Plateforme immobilière en ligne pour le marché sénégalais (location et vente).
Développée par **Naratechvision** (contact@naratechvision.com).
**Scope : web uniquement** — mobile hors périmètre.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Next.js 16.2.9 / React 19 / TypeScript |
| Backend | Laravel 13.8 / PHP 8.3 |
| Base de données | PostgreSQL 17 |
| Auth | Laravel Sanctum (tokens Bearer, 7 jours) |
| Styles | Tailwind CSS v4 |
| État global | Zustand v5 (persist localStorage) |
| Requêtes | TanStack Query v5 + Axios |
| Formulaires | react-hook-form v7 + Zod v4 |
| PDF | barryvdh/laravel-dompdf |

---

## Structure du projet

```
Ker_connect/
├── backend/          # Laravel 13 (API REST)
├── frontend/         # Next.js 16
├── start-dev.bat     # Lance les deux serveurs en local (Windows)
├── CLAUDE.md         # Ce fichier
└── .github/workflows/ # CI/CD
```

### Backend (`backend/`)
```
app/
├── Http/Controllers/Api/
│   ├── AuthController.php       # Login, register, OTP, admin 2FA
│   ├── BienController.php       # Annonces immobilières
│   ├── PaiementController.php   # Paiements loyer/vente + commission
│   ├── ContratController.php    # Contrats de location/vente
│   ├── DemandeController.php    # Demandes clients
│   ├── AdminController.php      # Dashboard admin, gestion users/annonces
│   ├── InscriptionController.php # Frais inscription bailleur
│   └── ...
├── Http/Middleware/
│   ├── RoleMiddleware.php        # Vérifie le rôle (admin/bailleur/client)
│   └── CheckInscriptionPayee.php # Bloque bailleur sans inscription payée
└── Models/
    ├── User.php     # Roles, forfaits, commission, 2FA token admin
    ├── Bien.php     # Annonces (statut: brouillon/publie/loue/vendu)
    ├── Paiement.php # Loyers + caution
    ├── Contrat.php
    └── Setting.php  # Paramètres plateforme (commission, frais)
```

### Frontend (`frontend/src/`)
```
app/
├── (public)          # page.tsx, location, vente, biens/[id], tarifs, contact
├── auth/             # login, register, verify-otp, forgot-password, reset-password
│   ├── paiement-inscription/  # Choix forfait bailleur (+ upgrade)
│   └── admin/confirm/[token]/ # Confirmation 2FA admin
├── client/           # dashboard, demandes, paiements, favoris, alertes, compte
├── bailleur/         # dashboard, annonces, biens, demandes, paiements, rapport, compte
└── admin/            # dashboard, users, annonces, transactions, abonnements, settings
components/
├── layout/           # Navbar, Footer
├── biens/            # CartesBien, FiltreBien
└── ui/               # Logo, composants partagés
lib/
└── api.ts            # Instance Axios (intercepteur 401 → "Session expirée")
store/
└── auth.store.ts     # Zustand : user, token, isAuthenticated, setAuth, clearAuth
```

---

## 4 rôles utilisateurs

| Rôle | Description | Accès |
|---|---|---|
| `client` | Cherche un bien à louer ou acheter | `/client/*` |
| `bailleur` | Loue ses biens | `/bailleur/*` — doit payer les frais d'inscription |
| `proprietaire` | Vend ses biens | `/bailleur/*` — même espace que bailleur |
| `admin` | Gère toute la plateforme | `/admin/*` — login 2FA obligatoire |

---

## Forfaits bailleur

| Forfait | Prix | Annonces max | Durée |
|---|---|---|---|
| Starter | Gratuit | 2 | 30 jours (essai) |
| Pro | 5 000 FCFA/mois | 15 | Mensuel |
| Pro Max (agence) | 10 000 FCFA/mois | Illimité | Mensuel |

- Le quota compte les biens au statut `publie` **ET** `loue` (un bien loué occupe toujours un slot).
- En base : `forfait` = `'starter'|'pro'|'agence'`, `forfait_expire_at` = date d'expiration.
- Taux de commission : Starter = 5%, Pro = 4%, Agence = 3%.

---

## Logique métier critique

### Caution (locations)
- **1er paiement** = `caution_mois × montant_loyer` (loyer inclus dans la caution, pas en plus)
- **Mois suivants** = `montant_loyer` seulement
- Champ `caution_mois` sur le modèle `Bien` (0 = pas de caution)

### Commission KerConnect
- Toujours calculée sur le **loyer de base uniquement** : `montant_base × taux / 100`
- Jamais sur la caution

### Formule paiement total
```
si premier paiement et location avec caution :
  caution_montant = caution_mois × montant_base
  total = caution_montant + commission
sinon :
  total = montant_base + commission
```

---

## Sécurité admin — Login 2FA

Le compte admin ne reçoit **jamais** de JWT directement à la connexion.

**Flow :**
1. `POST /v1/auth/login` avec credentials admin
2. Backend génère un token SHA-256, l'enregistre en base avec expiry 15 min
3. Envoie un email à `contact@naratechvision.com` avec le lien de confirmation
4. Retourne `{ pending_admin_confirmation: true }` (pas de JWT)
5. Frontend affiche "Vérifiez votre email"
6. Admin clique le lien → `GET /v1/auth/admin/confirm/{token}` → reçoit le JWT

**Compte admin en base :**
- Email : `contact@naratechvision.com`
- Mot de passe : `KerConnect2026!`

**Si l'email ne fonctionne pas (dev) :** cherche dans `backend/storage/logs/laravel.log` la ligne :
```
[DEV] Lien confirmation admin : http://localhost:3000/auth/admin/confirm/xxxxx
```

---

## Variables d'environnement

### Backend — `backend/.env`
```env
APP_NAME=KerConnect
APP_ENV=local                         # production en prod
APP_KEY=base64:...                    # généré par artisan key:generate
APP_DEBUG=true                        # false en production
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000    # URL frontend (pour les liens email)

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=kerconnect
DB_USERNAME=postgres
DB_PASSWORD=...

MAIL_MAILER=smtp
MAIL_SCHEME=smtps
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=contact@naratechvision.com
MAIL_PASSWORD="xxxx xxxx xxxx xxxx"  # Google App Password (16 chars)
MAIL_FROM_ADDRESS="contact@naratechvision.com"
MAIL_FROM_NAME="KerConnect"
```

> **IMPORTANT** : Gmail SMTP exige un **App Password**, pas le mot de passe Gmail ordinaire.
> Générer sur : https://myaccount.google.com/apppasswords

### Frontend — `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## Installation locale

### Prérequis
- PHP 8.3+, Composer
- Node.js 20+, npm
- PostgreSQL 17

### Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Configurer DB_* et MAIL_* dans .env
php artisan migrate
php artisan db:seed          # crée le compte admin + paramètres plateforme
php artisan storage:link     # pour les fichiers uploadés
php artisan serve            # http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
# Créer frontend/.env.local avec NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm run dev                  # http://localhost:3000
```

### Démarrage rapide (Windows)
Double-cliquer `start-dev.bat` — lance les deux serveurs automatiquement.

---

## API — Routes principales

### Publiques
```
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/verify-otp
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
GET  /api/v1/auth/admin/confirm/{token}   # Confirmation 2FA admin
GET  /api/v1/biens                        # Catalogue public
GET  /api/v1/biens/{id}
```

### Protégées (Bearer token requis)
```
GET  /api/v1/me
POST /api/v1/logout

# Client
GET  /api/v1/client/demandes
GET  /api/v1/client/paiements
GET  /api/v1/client/contrats

# Bailleur/Propriétaire
GET  /api/v1/bailleur/biens
POST /api/v1/bailleur/biens
GET  /api/v1/bailleur/paiements

# Admin
GET  /api/v1/admin/dashboard
GET  /api/v1/admin/users
GET  /api/v1/admin/transactions
PUT  /api/v1/admin/settings
```

---

## Intercepteur Axios (frontend)

`frontend/src/lib/api.ts` — gère automatiquement :
- Injection du token Bearer sur chaque requête (lu depuis `localStorage['token']`)
- Sur 401 reçu d'une route **protégée** → `clearAuth()` + redirect vers `/auth/login?expired=1`
- Les routes auth publiques (`/auth/login`, `/auth/register`, etc.) sont exclues du redirect 401

---

## Middleware Next.js

Les routes `/admin/*`, `/bailleur/*`, `/client/*` sont protégées par vérification des cookies `kc_auth` et `kc_role` (posés par `setAuth()` dans le store Zustand).

---

## Informations de contact plateforme

- **Adresse** : Dakar, Sénégal
- **Téléphone** : +221 71 030 70 54
- **Email** : contact@naratechvision.com
- **GitHub** : https://github.com/Evadiouf/kerconnect

---

## Points d'attention pour le déploiement

1. **Ne jamais committer `.env`** — il est gitignored
2. Mettre `APP_DEBUG=false` et `APP_ENV=production` en production
3. Configurer `FRONTEND_URL` avec l'URL réelle du frontend en production
4. Exécuter `php artisan config:cache` après chaque changement de `.env`
5. Le seeder `db:seed` crée l'admin avec email `demehawoly@gmail.com` — **mettre à jour en base** avec la vraie adresse admin : `contact@naratechvision.com`
6. `php artisan storage:link` est obligatoire pour servir les fichiers uploadés (contrats, photos)
7. Les tokens Sanctum expirent après **7 jours** — prévoir le refresh côté client si nécessaire
