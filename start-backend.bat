@echo off
title KerConnect - Backend Laravel :8000
echo.
echo ============================================
echo  KerConnect - Backend Laravel
echo  http://127.0.0.1:8000
echo ============================================
echo.
set PHPRC=C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64
set PATH=C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64;C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin;%PATH%
cd /d "C:\Users\DELL INSPIRON 16\Desktop\Dossier important\Ker_connect\backend"
echo Demarrage du serveur Laravel...
php -S 127.0.0.1:8000 -t public public/index.php
pause
