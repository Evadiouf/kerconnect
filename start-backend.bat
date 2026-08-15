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
php -d upload_max_filesize=100M -d post_max_size=120M -d max_execution_time=300 -d max_input_time=300 -d memory_limit=256M -S 127.0.0.1:8000 -t public public/index.php
pause
