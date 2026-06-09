@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title BRChain - inicio dos servicos
cd /d "%~dp0"

set "BASE=%~dp0"
if "%BASE:~-1%"=="\" set "BASE=%BASE:~0,-1%"

set "API_DIR=%BASE%\brchain_API-backend"
set "DASH_DIR=%BASE%\brchain-dashboard-master"
set "MOBILE_DIR=%BASE%\brchainFrontend-master"
set "LOG_DIR=%BASE%\.logs"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

cls
echo ===============================================
echo            BRChain - inicio dos servicos
echo ===============================================

REM --- Pre-checks
where node >nul 2>nul
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado. Instale em https://nodejs.org
    pause
    exit /b 1
)
where python >nul 2>nul
if errorlevel 1 (
    echo [ERRO] Python nao encontrado. Instale Python 3.10+ em https://python.org
    pause
    exit /b 1
)

REM --- Detectar IP da LAN via PowerShell
for /f "usebackq tokens=*" %%a in (`powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object {$_.IPAddress -like '192.168.*' -or $_.IPAddress -like '10.*' -or $_.IPAddress -like '172.16.*'} | Select-Object -First 1).IPAddress"`) do set "LAN_IP=%%a"
if "!LAN_IP!"=="" set "LAN_IP=127.0.0.1"

REM --- Localizar cloudflared
set "CF_EXE="
for /f "usebackq tokens=*" %%p in (`powershell -NoProfile -Command "(Get-Command cloudflared -ErrorAction SilentlyContinue).Source"`) do set "CF_EXE=%%p"
if "!CF_EXE!"=="" (
    REM Fallback: caminho fixo do winget
    set "CF_EXE=%LOCALAPPDATA%\Microsoft\WinGet\Packages\Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe\cloudflared.exe"
)

echo  Pasta:  %BASE%
echo  LAN IP: !LAN_IP!
echo  Logs:   %LOG_DIR%
echo.

REM --- Matar processos antigos nas portas usadas e cloudflared anterior
echo Liberando portas 8000 / 3000 / 8081...
for %%P in (8000 3000 8081) do (
    for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":%%P " ^| findstr LISTENING') do (
        taskkill /F /PID %%a >nul 2>nul
    )
)
taskkill /F /IM cloudflared.exe >nul 2>nul
timeout /t 1 /nobreak >nul

REM --- Garante venv + dependencias da API
if not exist "%API_DIR%\.venv\Scripts\python.exe" (
    echo Criando .venv da API ^(pode demorar^)...
    python -m venv "%API_DIR%\.venv"
)
"%API_DIR%\.venv\Scripts\python.exe" -c "import uvicorn" >nul 2>nul
if errorlevel 1 (
    echo Instalando dependencias da API ^(primeira vez, pode demorar^)...
    "%API_DIR%\.venv\Scripts\python.exe" -m pip install -q -r "%API_DIR%\requirements.txt"
)
"%API_DIR%\.venv\Scripts\python.exe" -c "import qrcode" >nul 2>nul
if errorlevel 1 (
    echo Instalando dependencia qrcode no venv...
    "%API_DIR%\.venv\Scripts\python.exe" -m pip install -q qrcode
)
"%API_DIR%\.venv\Scripts\python.exe" -c "import email_validator" >nul 2>nul
if errorlevel 1 (
    echo Instalando dependencia email-validator no venv...
    "%API_DIR%\.venv\Scripts\python.exe" -m pip install -q email-validator
)

REM --- Garante node_modules dos frontends
if not exist "%DASH_DIR%\node_modules" (
    echo Instalando dependencias do Dashboard...
    pushd "%DASH_DIR%"
    call npm install
    popd
)
if not exist "%MOBILE_DIR%\node_modules" (
    echo Instalando dependencias do Mobile...
    pushd "%MOBILE_DIR%"
    call npm install
    popd
)

REM --- Escolhe entry point da API (prefere main_gnews.py como no .command)
if exist "%API_DIR%\main_gnews.py" (
    set "API_ENTRY=main_gnews.py"
) else (
    set "API_ENTRY=main.py"
)

REM --- 1) API em janela propria
echo [1/3] API ^(FastAPI^) em http://!LAN_IP!:8000 ...
start "BRChain API" /D "%API_DIR%" cmd /k ".venv\Scripts\python.exe !API_ENTRY!"
timeout /t 3 /nobreak >nul

REM --- 2) Dashboard em janela propria
echo [2/3] Dashboard ^(Next.js^) em http://localhost:3000 ...
start "BRChain Dashboard" /D "%DASH_DIR%" cmd /k "npm run dev"

REM --- 3) Cloudflare Tunnel para a API (sem conta, URL publica HTTPS)
echo [3/4] Criando tunnel HTTPS para a API via Cloudflare...
set "CF_LOG=%TEMP%\cf_tunnel_brchain.log"
if exist "!CF_LOG!" del /f /q "!CF_LOG!"
start /b "" "!CF_EXE!" tunnel --url http://localhost:8000 --logfile "!CF_LOG!" --no-autoupdate

REM Aguardar URL do tunnel aparecer no log (ate 30s)
set "TUNNEL_URL="
set /a TRIES=0
:wait_cf
set /a TRIES+=1
if !TRIES! gtr 30 goto :cf_timeout
timeout /t 1 /nobreak >nul
for /f "usebackq tokens=*" %%u in (`powershell -NoProfile -Command "if (Test-Path '!CF_LOG!') { (Get-Content '!CF_LOG!' -Raw) -match 'https://[a-z0-9\-]+\.trycloudflare\.com' | Out-Null; $Matches[0] }"`) do set "TUNNEL_URL=%%u"
if "!TUNNEL_URL!"=="" goto :wait_cf
goto :cf_ready

:cf_timeout
echo [AVISO] Tunnel Cloudflare nao respondeu. Usando IP local como fallback.
set "TUNNEL_URL=http://!LAN_IP!:8000"

:cf_ready
REM --- Escrever URL no .env do mobile
> "%MOBILE_DIR%\.env" echo EXPO_PUBLIC_API_URL=!TUNNEL_URL!

REM --- 4) Expo com tunnel URL ja no .env
echo [4/4] Mobile ^(Expo^) com API em !TUNNEL_URL! ...
start "BRChain Mobile" /D "%MOBILE_DIR%" cmd /k "npx expo start --tunnel --clear"

echo.
cls
echo ===============================================
echo                 TUDO PRONTO!
echo ===============================================
echo  API local   http://!LAN_IP!:8000
echo  API publica !TUNNEL_URL!
echo  Dashboard   http://localhost:3000/login
echo  Mobile      Escaneie o QR na janela "BRChain Mobile"
echo ===============================================
echo.
echo Login:
echo   Admin    admin@brchain.com  / 123
echo   Usuario  joao@gmail.com     / qualquer senha
echo.
echo ===============================================
echo  Pra parar: feche as janelas BRChain API,
echo  BRChain Dashboard e BRChain Mobile.
echo ===============================================
echo.
pause