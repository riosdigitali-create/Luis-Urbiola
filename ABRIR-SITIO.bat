@echo off
title La Esquina - Abarrotes y Papeleria
cd /d "%~dp0"
where node >nul 2>nul || (echo Necesitas instalar Node.js desde https://nodejs.org & pause & exit /b)
node scripts\build-config.mjs
node scripts\build-pages.mjs
start "" http://localhost:4321
node servidor.mjs
pause
