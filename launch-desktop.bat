@echo off
title Cheko POS Desktop
cd /d "%~dp0"
echo Starting Cheko POS (Electron + Vite)...
echo Close this window to stop the app.
npm run dev:desktop
