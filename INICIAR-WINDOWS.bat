@echo off
setlocal
set "FILE=%~dp0dist\index.html"
if not exist "%FILE%" (
 echo ERROR: Falta dist\index.html. Extraiga todo el ZIP primero.
 pause
 exit /b 1
)
start "" "%FILE%"
