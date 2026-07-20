@echo off
title KerConnect - Demarrage des serveurs
echo.
echo  ╔══════════════════════════════════════╗
echo  ║    KERCONNECT - Demarrage local      ║
echo  ╚══════════════════════════════════════╝
echo.

echo  [1/2] Demarrage du backend Laravel...
start "KerConnect Backend (Laravel)" cmd /k "cd /d ""C:\Users\DELL INSPIRON 16\Desktop\Dossier important\Ker_connect\backend"" && php artisan serve"

timeout /t 3 /nobreak > nul

echo  [2/2] Demarrage du frontend Next.js...
start "KerConnect Frontend (Next.js)" cmd /k "cd /d ""C:\Users\DELL INSPIRON 16\Desktop\Dossier important\Ker_connect\frontend"" && npm run dev"

echo.
echo  ✓ Les deux serveurs demarrent dans des fenetres separees.
echo.
echo  Backend  → http://127.0.0.1:8000
echo  Frontend → http://localhost:3000
echo.
timeout /t 5 /nobreak > nul
start "" "http://localhost:3000"
