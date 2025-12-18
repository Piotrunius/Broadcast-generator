@echo off
echo Starting Broadcast Generator Server...
echo.
echo Opening in browser at: http://localhost:8000/pages/home/index.html
echo.
echo Press Ctrl+C to stop the server
echo.

REM Try python first, then python3
python -m http.server 8000 2>nul
if errorlevel 1 (
    python3 -m http.server 8000
)
