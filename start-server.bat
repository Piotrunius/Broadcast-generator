@echo off
echo Starting Broadcast Generator Server...
echo.

REM Wait a moment then open browser
timeout /t 2 /nobreak >nul
start "" "http://localhost:8000/index.html"

REM Try to use custom server first (better MIME type support)
if exist server.py (
    python server.py 2>nul
    if errorlevel 1 (
        python3 server.py 2>nul
    )
    if errorlevel 1 (
        goto fallback
    )
) else (
    :fallback
    echo Using basic HTTP server...
    python -m http.server 8000 2>nul
    if errorlevel 1 (
        python3 -m http.server 8000
    )
)
